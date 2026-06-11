import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(@CurrentUser() user: any) {
    console.log('[DEBUG Notifications] Logged in user:', user);
    // Temporary test to see if the table can be read at all
    const notifications = await this.svc.findAllForUser(user.id);
    console.log(`[DEBUG Notifications] Returning ${notifications.length} notifications for user ${user.id}`);
    
    // Fallback: If 0, try fetching all to see if ANY exist in the repo
    if (notifications.length === 0) {
      const all = await this.svc['repo'].find();
      console.log(`[DEBUG Notifications] Total in DB: ${all.length}`);
    }
    
    return notifications;
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.svc.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.svc.markAllAsRead(user.id);
  }
}
