import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() shortName: string;
  @ApiProperty() @IsString() employeeCode: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() phone?: string;
  @ApiProperty({ type: [String] }) @IsArray() subjectIds: string[];
  @ApiProperty({ type: [String] }) @IsArray() subjectNames: string[];
  @ApiProperty({ type: [String] }) @IsArray() gradeLevel: string[];
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() maxPeriodsDay?: number;
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() maxPeriodsWeek?: number;
  @ApiProperty({ required: false }) @IsString() @IsOptional() status?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}

export class UpdateTeacherDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() name?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() shortName?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() email?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() phone?: string;
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() subjectIds?: string[];
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() subjectNames?: string[];
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() gradeLevel?: string[];
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() maxPeriodsDay?: number;
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() maxPeriodsWeek?: number;
  @ApiProperty({ required: false }) @IsString() @IsOptional() status?: string;
}
