import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../enums/attendance-status.enum';

class StudentAttendanceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class MarkAttendanceDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  attendance: StudentAttendanceDto[];
}

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}
