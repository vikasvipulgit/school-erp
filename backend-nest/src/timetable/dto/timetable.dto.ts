import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';

export class SaveTimetableDto {
  @ApiProperty({ description: 'Grid data keyed by class-section' })
  @IsObject()
  grids: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  schoolId?: string;
}

export class SaveTimetableSettingsDto {
  @ApiProperty({ type: [Object] }) @IsArray() periodSlots: object[];
  @ApiProperty({ type: [String] }) @IsArray() workingDays: string[];
  @ApiProperty() @IsObject() rules: object;
  @ApiProperty({ required: false }) @IsOptional() schoolId?: string;
}
