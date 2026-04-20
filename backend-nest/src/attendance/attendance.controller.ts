import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.TEACHER)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List attendance records (teacher+)' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Mark attendance (teacher+)' })
  mark(@Body() dto: MarkAttendanceDto, @CurrentUser() user: any) {
    return this.svc.mark(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance record (teacher+)' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.svc.update(id, dto);
  }
}
