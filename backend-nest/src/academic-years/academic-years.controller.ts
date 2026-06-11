import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AcademicYearsService } from './academic-years.service';

@Controller('academic-years')
@UseGuards(AuthGuard('jwt'))
export class AcademicYearsController {
  constructor(private readonly service: AcademicYearsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  getActive() {
    return this.service.getActiveAcademicYear();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(+id, dto);
  }
}
