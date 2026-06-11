import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CircularService } from './circular.service';
import { CreateCircularDto, UpdateCircularDto } from './circular.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('circulars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CircularController {
  constructor(private readonly circularService: CircularService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  create(@Body() createCircularDto: CreateCircularDto, @CurrentUser() user: any) {
    return this.circularService.create(createCircularDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.circularService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.circularService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  update(@Param('id') id: string, @Body() updateCircularDto: UpdateCircularDto, @CurrentUser() user: any) {
    return this.circularService.update(id, updateCircularDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.circularService.remove(id, user);
  }
}
