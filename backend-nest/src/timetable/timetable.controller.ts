import {
  Controller, Get, Post, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { SaveTimetableDto, SaveTimetableSettingsDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly svc: TimetableService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get timetable settings (period slots, working days, rules)' })
  getSettings() { return this.svc.getSettings(); }

  @Post('settings')
  @UseGuards(RolesGuard) @MinRole(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Save timetable settings (principal+)' })
  saveSettings(@Body() dto: SaveTimetableSettingsDto) { return this.svc.saveSettings(dto); }

  @Get()
  @ApiOperation({ summary: 'Get active published timetable' })
  getActive() { return this.svc.getActive(); }

  @Get('history')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'List timetable history (coordinator+)' })
  history() { return this.svc.findHistory(); }

  @Post('save')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Save timetable draft (admin/coordinator only)' })
  save(@Body() dto: SaveTimetableDto, @CurrentUser() user: any) {
    return this.svc.save(dto, user);
  }

  @Post('publish')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Save and publish timetable immediately (admin/coordinator only)' })
  publish(@Body() dto: SaveTimetableDto, @CurrentUser() user: any) {
    return this.svc.saveAndPublish(dto, user);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Publish an existing draft timetable by id (admin/coordinator only)' })
  publishById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.publish(id, user);
  }

  @Post('draft')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  saveDraft(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.saveDraft(dto, user);
  }

  @Post('class/publish')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  publishDraft(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.publishDraft(dto, user);
  }

  @Get('teacher/view')
  getTeacherTimetable(@CurrentUser() user: any) {
    return this.svc.getTeacherTimetable(user);
  }

  @Get('student/me')
  @UseGuards(RolesGuard) @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get timetable for logged in student' })
  getStudentTimetable(@CurrentUser() user: any) {
    return this.svc.getStudentTimetable(user);
  }

  @Get(':classId')
  getByClass(@Param('classId') classId: string) {
    return this.svc.getByClass(classId);
  }

  @Delete(':classId')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Delete a specific class timetable (admin/coordinator only)' })
  deleteTimetable(@Param('classId') classId: string) {
    return this.svc.deleteByClass(classId);
  }
}
