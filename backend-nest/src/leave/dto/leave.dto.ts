import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class SubmitLeaveDto {
  @ApiProperty({ enum: ['sick', 'casual', 'emergency', 'other'] })
  @IsString()
  @IsIn(['sick', 'casual', 'emergency', 'other'])
  leaveType: string;

  @ApiProperty() @IsString() startDate: string;
  @ApiProperty() @IsString() endDate: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() reason?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() teacherId?: string;
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
