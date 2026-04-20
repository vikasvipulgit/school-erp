import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateAssignmentStatusDto } from './dto/tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks (admin/principal: all; teacher: assigned to them)' })
  findAll(@CurrentUser() user: any) { return this.svc.findAllTasks(user); }

  @Get('assignments/all')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'All assignments with embedded task data (admin/principal)' })
  allAssignments() { return this.svc.getAllAssignmentsWithTasks(); }

  @Get('assignments/mine')
  @ApiOperation({ summary: 'Current teacher\'s assignments with task data' })
  myAssignments(@CurrentUser() user: any) { return this.svc.getMyAssignments(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  findOne(@Param('id') id: string) { return this.svc.findOneTask(id); }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'Get all assignments for a task' })
  assignmentsForTask(@Param('id') id: string) { return this.svc.getAssignmentsForTask(id); }

  @Post()
  @UseGuards(RolesGuard)
  @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Create task and assignments (coordinator+)' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    return this.svc.createTask(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task (creator or admin/principal)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.svc.updateTask(id, dto, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel task (creator or admin)' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelTask(id, user);
  }

  @Patch('assignments/:assignmentId/status')
  @ApiOperation({ summary: 'Update assignment status (assigned teacher or admin)' })
  updateStatus(
    @Param('assignmentId') id: string,
    @Body() dto: UpdateAssignmentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateAssignmentStatus(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task and all assignments (admin)' })
  remove(@Param('id') id: string) { return this.svc.removeTask(id); }

  @Post('mark-overdue')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark overdue assignments (admin — run as cron)' })
  markOverdue() { return this.svc.markOverdueTasks(); }
}
