import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsObject, IsOptional } from 'class-validator';

export class SaveTimetableDto {
  @ApiProperty({ description: 'Grid data keyed by class-section' })
  @IsObject()
  grids: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  schoolId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class SaveTimetableSettingsDto {
  @ApiProperty({ type: [Object] }) @IsArray() periodSlots: object[];
  @ApiProperty({ type: [String] }) @IsArray() workingDays: string[];
  @ApiProperty() @IsObject() rules: object;
  @ApiProperty({ required: false }) @IsOptional() schoolId?: string;
}
