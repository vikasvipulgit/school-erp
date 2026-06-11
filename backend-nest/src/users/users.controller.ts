import {
  Controller, Get, Patch, Delete, Post,
  Param, Body, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post('save-fcm-token')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save FCM token for current user' })
  saveFcmToken(@CurrentUser() user: any, @Body('fcmToken') fcmToken: string) {
    return this.svc.saveFcmToken(user.id, fcmToken);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'List all users (admin/principal)' })
  findAll(@Query('role') role?: string) { return this.svc.findAll(role); }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (admin)' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
