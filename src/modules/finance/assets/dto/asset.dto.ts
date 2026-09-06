import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AssetCategory } from '../../../../common/enums';

export class CreateAssetDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsOptional() @IsEnum(AssetCategory) category?: AssetCategory;
  @IsOptional() @IsString() @MaxLength(60) customCategory?: string;
  @IsNumber() @Min(0) currentValue: number;
  @IsOptional() @IsNumber() @Min(0) purchaseValue?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsDateString() acquiredDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) tags?: string[];
}

export class UpdateAssetDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsEnum(AssetCategory) category?: AssetCategory;
  @IsOptional() @IsString() @MaxLength(60) customCategory?: string;
  @IsOptional() @IsNumber() @Min(0) currentValue?: number;
  @IsOptional() @IsNumber() @Min(0) purchaseValue?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsDateString() acquiredDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) tags?: string[];
}
