import {
  Controller, Get, Post, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { SaveTimetableDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly svc: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'Get active published timetable' })
  getActive() { return this.svc.getActive(); }

  @Get('history')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'List timetable history (coordinator+)' })
  history() { return this.svc.findHistory(); }

  @Post('save')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Save timetable draft (coordinator+)' })
  save(@Body() dto: SaveTimetableDto, @CurrentUser() user: any) {
    return this.svc.save(dto, user);
  }

  @Post('publish')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Save and publish timetable immediately (coordinator+)' })
  publish(@Body() dto: SaveTimetableDto, @CurrentUser() user: any) {
    return this.svc.saveAndPublish(dto, user);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard) @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Publish an existing draft timetable by id (coordinator+)' })
  publishById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.publish(id, user);
  }
}
