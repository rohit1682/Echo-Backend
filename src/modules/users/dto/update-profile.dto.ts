import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ThemePreference } from '../../../common/enums';

class ReminderDefaultsDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(365, { each: true })
  daysBefore?: number[];
}

class PreferencesDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  theme?: ThemePreference;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  biometricLockEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  syncContacts?: boolean;

  @IsOptional()
  @IsBoolean()
  syncCalendar?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderDefaultsDto)
  reminderDefaults?: ReminderDefaultsDto;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}
