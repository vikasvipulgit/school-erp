import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskAssignmentStatus } from '../../database/entities/task-assignment.entity';

export class CreateTaskDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() priority?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() startDate?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() dueDate?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() remarks?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() createdByName?: string;
  @ApiProperty({ type: [String] }) @IsArray() assignedTo: string[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() status?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() priority?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() startDate?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() dueDate?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() remarks?: string;
}

export class UpdateAssignmentStatusDto {
  @ApiProperty({ enum: TaskAssignmentStatus })
  @IsEnum(TaskAssignmentStatus)
  status: TaskAssignmentStatus;
}
