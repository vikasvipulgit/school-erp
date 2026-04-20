import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class SaveTimetableDto {
  @ApiProperty({ description: 'Grid data keyed by class-section' })
  @IsObject()
  grids: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  schoolId?: string;
}
