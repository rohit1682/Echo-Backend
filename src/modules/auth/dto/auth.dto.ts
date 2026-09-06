import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/; // E.164-ish

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class GoogleAuthDto {
  /** The Google ID token obtained on the device via Google Sign-In. */
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class RequestOtpDto {
  @Matches(PHONE_REGEX, { message: 'Provide a valid phone number in international format' })
  phone: string;
}

export class VerifyOtpDto {
  @Matches(PHONE_REGEX, { message: 'Provide a valid phone number in international format' })
  phone: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}
