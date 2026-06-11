import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.TEACHER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List all reports (teacher+)' })
  findAll() { return this.svc.findAll(); }

  @Get('substitution')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Substitution report (admin/principal)' })
  getSubstitution(@Query('date') date: string) {
    return this.svc.getSubstitutionReport(date);
  }

  @Get('tasks/pending')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Pending tasks report (admin/principal)' })
  getPendingTasks() {
    return this.svc.getPendingTasksReport();
  }

  @Get('tasks/overdue')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Overdue tasks report (admin/principal)' })
  getOverdueTasks() {
    return this.svc.getOverdueTasksReport();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by id (teacher+)' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create report (admin)' })
  create(@Body() dto: CreateReportDto, @CurrentUser() user: any) {
    return this.svc.create(dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete report (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
