import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber() @Min(0) amount: number;
  @IsOptional() @IsString() @MaxLength(300) description?: string;
  @IsOptional() @IsMongoId() categoryId?: string;
  @IsOptional() @IsDateString() spentAt?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) tags?: string[];
}

export class UpdateExpenseDto {
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() @MaxLength(300) description?: string;
  @IsOptional() @IsMongoId() categoryId?: string;
  @IsOptional() @IsDateString() spentAt?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) tags?: string[];
}
