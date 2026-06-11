import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('mailbox')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  create(@Body() createMailboxDto: CreateMailboxDto, @CurrentUser() user: any) {
    return this.mailboxService.create(createMailboxDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.mailboxService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mailboxService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  update(@Param('id') id: string, @Body() updateMailboxDto: UpdateMailboxDto, @CurrentUser() user: any) {
    return this.mailboxService.update(id, updateMailboxDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mailboxService.remove(id, user);
  }
}
