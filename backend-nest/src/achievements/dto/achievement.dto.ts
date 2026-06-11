import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  awardedOn?: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  awardedOn?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
