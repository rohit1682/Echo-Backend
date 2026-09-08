import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Frequency } from '../../../../common/enums';

export class CreateBudgetDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsOptional() @IsMongoId() categoryId?: string;
  @IsNumber() @Min(0) limit: number;
  @IsOptional() @IsEnum(Frequency) period?: Frequency;
  @IsOptional() @IsString() currency?: string;
}

export class UpdateBudgetDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsMongoId() categoryId?: string;
  @IsOptional() @IsNumber() @Min(0) limit?: number;
  @IsOptional() @IsEnum(Frequency) period?: Frequency;
  @IsOptional() @IsString() currency?: string;
}
