import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePeriodDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsNumber() number: number;
  @ApiProperty() @IsString() startTime: string;
  @ApiProperty() @IsString() endTime: string;
  @ApiProperty({ required: false }) @IsBoolean() @IsOptional() isBreak?: boolean;
  @ApiProperty() @IsString() label: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}

export class UpdatePeriodDto {
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() number?: number;
  @ApiProperty({ required: false }) @IsString() @IsOptional() startTime?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() endTime?: string;
  @ApiProperty({ required: false }) @IsBoolean() @IsOptional() isBreak?: boolean;
  @ApiProperty({ required: false }) @IsString() @IsOptional() label?: string;
}
