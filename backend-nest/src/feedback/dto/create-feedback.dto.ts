import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { FeedbackType } from '../../database/entities/feedback.entity';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsNotEmpty()
  @IsUUID()
  teacherId: string;
}
