import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { AuthProvider } from '../../common/enums';
import { OtpService } from './otp/otp.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: UserDocument;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly otp: OtpService,
  ) {}

  // ---- Email / password ----

  async register(email: string, password: string, name?: string): Promise<AuthResult> {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.users.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      authProviders: [{ provider: AuthProvider.PASSWORD, providerId: email.toLowerCase().trim() }],
    });
    return this.issue(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email, true);
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid email or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return this.issue(user);
  }

  // ---- Google Sign-In ----

  async google(idToken: string): Promise<AuthResult> {
    const clientIds = this.config.get<string[]>('googleClientIds', []);
    if (clientIds.length === 0) {
      throw new UnauthorizedException('Google Sign-In is not configured on the server');
    }

    const ticket = await this.googleClient.verifyIdToken({ idToken, audience: clientIds });
    const payload = ticket.getPayload();
    if (!payload?.sub) throw new UnauthorizedException('Invalid Google token');

    let user = await this.users.findByProvider(AuthProvider.GOOGLE, payload.sub);
    if (!user && payload.email) {
      user = await this.users.findByEmail(payload.email);
      if (user) await this.users.linkProvider(user.id, AuthProvider.GOOGLE, payload.sub);
    }
    if (!user) {
      user = await this.users.create({
        email: payload.email?.toLowerCase(),
        name: payload.name,
        avatarUrl: payload.picture,
        emailVerified: !!payload.email_verified,
        authProviders: [{ provider: AuthProvider.GOOGLE, providerId: payload.sub }],
      });
    }
    return this.issue(user);
  }

  // ---- Phone OTP ----

  requestOtp(phone: string) {
    return this.otp.request(phone);
  }

  async verifyOtp(phone: string, code: string): Promise<AuthResult> {
    await this.otp.verify(phone, code);
    let user = await this.users.findByPhone(phone);
    if (!user) {
      user = await this.users.create({
        phone,
        phoneVerified: true,
        authProviders: [{ provider: AuthProvider.PHONE, providerId: phone }],
      });
    }
    return this.issue(user);
  }

  // ---- Tokens ----

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.users.findByIdWithSecrets(payload.sub);
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session revoked');

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      // Token reuse / theft — revoke the session.
      await this.users.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    const tokens = await this.signTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  private async issue(user: UserDocument): Promise<AuthResult> {
    const tokens = await this.signTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  }

  private async signTokens(user: UserDocument): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessTtl') as any,
      }),
      this.jwt.signAsync(
        { sub: user.id },
        {
          secret: this.config.get<string>('jwt.refreshSecret'),
          expiresIn: this.config.get<string>('jwt.refreshTtl') as any,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.users.setRefreshTokenHash(userId, hash);
  }
}
