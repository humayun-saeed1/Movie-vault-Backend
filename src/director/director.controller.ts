import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DirectorService } from './director.service.js';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { Roles } from '../auth/role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.create(createDirectorDto);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-all')
  findAll() {
    return this.directorService.findAll();
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.directorService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateDirectorDto: UpdateDirectorDto) {
    return this.directorService.update(id, updateDirectorDto);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.directorService.remove(id);
  }
}
