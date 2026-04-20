import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty() @IsString() date: string;
  @ApiProperty() @IsString() classId: string;
  @ApiProperty() @IsString() section: string;
  @ApiProperty() @IsString() subjectId: string;
  @ApiProperty() @IsString() teacherId: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() periodId?: string;
  @ApiProperty({ description: 'Array of { studentId, status }' })
  @IsArray()
  records: Record<string, any>[];
}

export class UpdateAttendanceDto {
  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  records?: Record<string, any>[];
}
