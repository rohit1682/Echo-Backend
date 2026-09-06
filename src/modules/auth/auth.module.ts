import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Otp, OtpSchema } from './otp/otp.schema';
import { OtpService } from './otp/otp.service';
import { ConsoleSmsProvider, SMS_PROVIDER, SmsProvider } from './otp/sms-provider';

/**
 * Factory that selects the active SMS provider from config. Today only the free
 * `console` provider exists; add `twilio`/`msg91`/`email` cases here later.
 */
const smsProviderFactory = {
  provide: SMS_PROVIDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): SmsProvider => {
    const provider = config.get<string>('otp.provider', 'console');
    switch (provider) {
      case 'console':
      default:
        return new ConsoleSmsProvider();
    }
  },
};

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, OtpService, smsProviderFactory],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
