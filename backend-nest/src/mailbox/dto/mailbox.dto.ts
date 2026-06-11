import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { MailboxCategory } from '../../database/entities/mailbox.entity';

export class CreateMailboxDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(MailboxCategory)
  @IsNotEmpty()
  category: MailboxCategory;
}

export class UpdateMailboxDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;

  @IsOptional()
  @IsEnum(MailboxCategory)
  @IsNotEmpty()
  category?: MailboxCategory;
}
