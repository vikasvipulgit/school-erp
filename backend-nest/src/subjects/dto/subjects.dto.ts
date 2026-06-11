import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() id?: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() code?: string;
  @ApiProperty() @IsNumber() periodsPerWeek: number;
  @ApiProperty({ required: false }) @IsBoolean() @IsOptional() isElective?: boolean;
  @ApiProperty({ required: false }) @IsNumber() @Min(1) @Max(10) @IsOptional() difficulty?: number;
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() gradeLevel?: string[];
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}

export class UpdateSubjectDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() name?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() code?: string;
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() periodsPerWeek?: number;
  @ApiProperty({ required: false }) @IsBoolean() @IsOptional() isElective?: boolean;
  @ApiProperty({ required: false }) @IsNumber() @Min(1) @Max(10) @IsOptional() difficulty?: number;
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() gradeLevel?: string[];
}
