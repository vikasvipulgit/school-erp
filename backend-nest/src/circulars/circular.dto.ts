import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CircularCategory } from '../database/entities/circular.entity';

export class CreateCircularDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CircularCategory)
  @IsNotEmpty()
  category: CircularCategory;
}

export class UpdateCircularDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(CircularCategory)
  @IsNotEmpty()
  category?: CircularCategory;
}
