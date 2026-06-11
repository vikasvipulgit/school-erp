import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitLeaveDto {
  @ApiProperty({ enum: ['sick', 'casual', 'emergency', 'other'] })
  @IsString()
  @IsIn(['sick', 'casual', 'emergency', 'other'])
  leaveType: string;

  @ApiProperty() @IsString() startDate: string;
  @ApiProperty() @IsString() endDate: string;

  @ApiProperty({ enum: ['FULL_DAY', 'HALF_DAY'], default: 'FULL_DAY' })
  @IsString()
  @IsIn(['FULL_DAY', 'HALF_DAY'])
  @IsOptional()
  leaveDuration?: string;

  @ApiProperty({ required: false }) @IsString() @IsOptional() reason?: string;
}

export class ReviewLeaveDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() remarks?: string;
}

export class CreateProxyDto {
  @ApiProperty() @IsString() originalTeacherId: string;
  @ApiProperty() @IsString() proxyTeacherId: string;
  @ApiProperty() @IsString() classId: string;
  @ApiProperty() @IsString() subjectId: string;
  @ApiProperty() @IsString() date: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() periodId?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() leaveApplicationId?: string;
}

export class AssignmentDto {
  @ApiProperty() @IsString() @IsNotEmpty() date: string;
  @ApiProperty() @IsNumber() @IsNotEmpty() period: number;
  @ApiProperty() @IsString() @IsNotEmpty() proxyTeacherId: string;
  @ApiProperty() @IsString() @IsNotEmpty() classId: string;
  @ApiProperty() @IsString() @IsNotEmpty() subjectId: string;
  @ApiProperty() @IsString() @IsNotEmpty() originalTeacherId: string;
}

export class AssignProxyBatchDto {
  @ApiProperty() @IsString() @IsNotEmpty() leaveId: string;
  
  @ApiProperty({ type: [AssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentDto)
  assignments: AssignmentDto[];
}
