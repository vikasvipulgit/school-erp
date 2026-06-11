import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  receiverId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isBroadcastToClass?: boolean;
}

export class ReplyMessageDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiProperty()
  @IsString()
  message: string;
}
