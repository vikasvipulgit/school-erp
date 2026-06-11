import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(Role.PRINCIPAL)
  create(@Request() req, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(req.user.id, createFeedbackDto);
  }

  @Get('my')
  @Roles(Role.TEACHER)
  findMy(@Request() req) {
    return this.feedbackService.getTeacherFeedback(req.user.id);
  }

  @Get('teachers')
  @Roles(Role.PRINCIPAL)
  getTeachers() {
    return this.feedbackService.getFeedbackTeachers();
  }

  @Get('sent')
  @Roles(Role.PRINCIPAL)
  findSent(@Request() req) {
    return this.feedbackService.getPrincipalSentFeedback(req.user.id);
  }

  @Patch(':id')
  @Roles(Role.PRINCIPAL)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(req.user.id, id, updateFeedbackDto);
  }

  @Delete(':id')
  @Roles(Role.PRINCIPAL)
  remove(@Request() req, @Param('id') id: string) {
    return this.feedbackService.deleteFeedback(req.user.id, id);
  }
}
