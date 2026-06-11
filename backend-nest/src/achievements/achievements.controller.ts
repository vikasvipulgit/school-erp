import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  create(@Body() dto: CreateAchievementDto, @CurrentUser() user: any) {
    return this.achievementsService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.achievementsService.findAll(user);
  }

  @Get('student/me')
  @Roles(Role.STUDENT)
  getStudentAchievements(@CurrentUser() user: any) {
    return this.achievementsService.getStudentAchievements(user);
  }

  @Get('students/list')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  getStudents(@CurrentUser() user: any) {
    return this.achievementsService.getStudents(user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.achievementsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
    @CurrentUser() user: any,
  ) {
    return this.achievementsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.achievementsService.remove(id, user);
  }
}
