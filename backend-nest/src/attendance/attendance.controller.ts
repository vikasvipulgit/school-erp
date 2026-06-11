import {
  Controller, Post, Get, Patch, Body, Param, Res, Query, UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

// Shape returned by JwtStrategy.validate()
interface AuthUser {
  id: string;         // UUID — for staff/teacher/admin
  studentId?: string; // e.g. ST101 — ONLY for students
  role: Role;
  teacherId?: string;
  schoolId?: string;
}

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Only teachers, admins, principals can mark attendance
  @Post('mark')
  @Roles(Role.TEACHER, Role.ADMIN, Role.PRINCIPAL)
  async markAttendance(
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attendanceService.markAttendance(dto, user.id);
  }

  // Only students can access their own attendance via /me
  @Get('student/me')
  @Roles(Role.STUDENT)
  async getMyAttendance(@CurrentUser() user: AuthUser) {
    // user.studentId is ST101 — set by JwtStrategy for student tokens
    return this.attendanceService.getStudentAttendanceSummary(user.studentId);
  }

  // Teachers/admins can view class attendance
  @Get('class/:id')
  @Roles(Role.TEACHER, Role.ADMIN, Role.PRINCIPAL)
  async getClassAttendance(
    @Param('id') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassAttendance(classId, date);
  }

  // Admin/principal can look up any student by their studentId (ST101)
  @Get('summary/student/:id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  async getStudentSummary(@Param('id') studentId: string) {
    return this.attendanceService.getStudentAttendanceSummary(studentId);
  }

  // Teachers can edit within 24h; admins/principals anytime
  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN, Role.PRINCIPAL)
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attendanceService.updateAttendance(id, dto, user.role);
  }

  // Student downloads their own CSV report
  @Get('student/me/report')
  @Roles(Role.STUDENT)
  async getMyReport(@CurrentUser() user: AuthUser, @Res() res: Response) {
    const csv = await this.attendanceService.getStudentAttendanceReportCSV(user.studentId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    return res.send(csv);
  }
}
