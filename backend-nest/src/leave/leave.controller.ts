import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { SubmitLeaveDto, ReviewLeaveDto, CreateProxyDto, AssignProxyBatchDto } from './dto/leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly svc: LeaveService) {}

  // ─── Proxy routes MUST come before /:id to avoid route shadowing ─────────

  @Get('proxy')
  @ApiOperation({ summary: 'List all proxy assignments' })
  listProxies() { return this.svc.findAllProxies(); }

  @Post('proxy')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.COORDINATOR, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Assign proxy teachers in batch' })
  assignProxy(@Body() dto: AssignProxyBatchDto, @CurrentUser() user: any) {
    return this.svc.assignProxyBatch(dto, user);
  }

  @Patch('proxy/:id/approve')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Approve proxy (coordinator+)' })
  approveProxy(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.approveProxy(id, user);
  }

  @Patch('proxy/:id/reject')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Reject proxy (coordinator+)' })
  rejectProxy(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.rejectProxy(id, user);
  }

  // ─── Leave application routes ─────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List leave applications (coordinator+: all; teacher: own)' })
  findAll(@CurrentUser() user: any) { return this.svc.findAll(user); }

  @Get('my')
  @ApiOperation({ summary: 'List my leave applications' })
  getMyLeaves(@CurrentUser() user: any) {
    return this.svc.findAll(user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get my leave balance stats' })
  getStats(@CurrentUser() user: any) {
    return this.svc.getMyLeaveStats(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave application by id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard) @Roles(Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Submit leave application (teacher or student)' })
  submit(@Body() dto: SubmitLeaveDto, @CurrentUser() user: any) {
    if (user.role !== Role.TEACHER && user.role !== Role.STUDENT) {
      throw new ForbiddenException('Only teachers and students can apply for leave');
    }
    return this.svc.submit(dto, user);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Approve leave (admin/principal only)' })
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.approve(id, dto, user);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: 'Reject leave (admin/principal only)' })
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.reject(id, dto, user);
  }
}
