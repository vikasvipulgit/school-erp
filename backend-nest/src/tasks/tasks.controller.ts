import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR)
  @ApiOperation({ summary: 'All assignments with embedded task data (admin/principal/coordinator)' })
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
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create task and assignments (admin only)' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.includes('pdf')) {
        return cb(new Error('Only PDF files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
      dto.fileUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    return this.svc.createTask(dto, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update task (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.svc.updateTask(id, dto, user);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel task (admin only)' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelTask(id, user);
  }

  @Patch(':id/cancel-all')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel task for all assignees (admin only)' })
  cancelAll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelTask(id, user);
  }

  @Patch('assignments/:id/cancel')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel single assignment (admin only)' })
  cancelSingle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelAssignment(id, user);
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
