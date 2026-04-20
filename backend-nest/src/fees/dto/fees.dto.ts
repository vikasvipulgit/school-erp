import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FeeStatus } from '../../database/entities/fee.entity';

export class CreateFeeDto {
  @ApiProperty() @IsString() studentId: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiProperty() @IsString() dueDate: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}

export class UpdateFeeDto {
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() amount?: number;
  @ApiProperty({ required: false }) @IsString() @IsOptional() dueDate?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() paidAt?: string;
  @ApiProperty({ enum: FeeStatus, required: false }) @IsEnum(FeeStatus) @IsOptional() status?: FeeStatus;
  @ApiProperty({ required: false }) @IsString() @IsOptional() description?: string;
}
