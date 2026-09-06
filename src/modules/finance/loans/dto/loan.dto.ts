import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RecordStatus } from '../../../../common/enums';

export class CreateLoanDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsOptional() @IsString() @MaxLength(120) lender?: string;
  @IsNumber() @Min(0) principal: number;
  @IsNumber() @Min(0) outstanding: number;
  @IsOptional() @IsNumber() @Min(0) interestRate?: number;
  @IsOptional() @IsNumber() @Min(0) emiAmount?: number;
  @IsOptional() @IsNumber() @Min(0) tenureMonths?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() nextDueDate?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class UpdateLoanDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(120) lender?: string;
  @IsOptional() @IsNumber() @Min(0) principal?: number;
  @IsOptional() @IsNumber() @Min(0) outstanding?: number;
  @IsOptional() @IsNumber() @Min(0) interestRate?: number;
  @IsOptional() @IsNumber() @Min(0) emiAmount?: number;
  @IsOptional() @IsNumber() @Min(0) tenureMonths?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() nextDueDate?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
