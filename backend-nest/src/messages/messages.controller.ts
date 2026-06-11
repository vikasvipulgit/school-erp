import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, ReplyMessageDto } from './dto/messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: any, @Query('q') q: string) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.getConversations(userId, user.role, q);
  }

  @Get('sent')
  getSentMessages(@CurrentUser() user: any, @Query('q') q: string) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.getSentMessages(userId, user.role, q);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.getUnreadCount(userId);
  }

  @Get('conversations/:id')
  getConversationDetails(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.getConversationDetails(id, userId);
  }

  @Post()
  sendMessage(@CurrentUser() user: any, @Body() dto: CreateMessageDto) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.sendMessage(userId, user.role, dto);
  }

  @Post('conversations/:id/reply')
  replyMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReplyMessageDto
  ) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    dto.conversationId = id;
    return this.messagesService.replyMessage(userId, user.role, dto);
  }

  @Delete(':id')
  deleteMessage(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = user.role === 'teacher' ? user.teacherId : user.id;
    return this.messagesService.deleteMessage(id, userId);
  }
}
