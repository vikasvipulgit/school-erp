import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() type?: string;
  @ApiProperty({ required: false }) @IsObject() @IsOptional() data?: Record<string, any>;
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}
