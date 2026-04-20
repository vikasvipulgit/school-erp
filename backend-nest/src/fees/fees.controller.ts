import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateFeeDto, UpdateFeeDto } from './dto/fees.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Fees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly svc: FeesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own fees (any authenticated user)' })
  findMine(@CurrentUser() user: any) { return this.svc.findMine(user.id); }

  @Get()
  @UseGuards(RolesGuard) @MinRole(Role.TEACHER)
  @ApiOperation({ summary: 'List all fees (teacher+)' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @UseGuards(RolesGuard) @MinRole(Role.TEACHER)
  @ApiOperation({ summary: 'Get fee record by id (teacher+)' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create fee record (admin)' })
  create(@Body() dto: CreateFeeDto) { return this.svc.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update fee record (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateFeeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete fee record (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
