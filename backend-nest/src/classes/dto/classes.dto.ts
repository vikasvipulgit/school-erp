import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ type: [String] }) @IsArray() sections: string[];
  @ApiProperty({ required: false }) @IsString() @IsOptional() schoolId?: string;
}

export class UpdateClassDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() name?: string;
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsOptional() sections?: string[];
}
