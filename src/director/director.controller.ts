import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
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
  create(@Body() createDirectorDto: CreateDirectorDto, @Req() req) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.directorService.create(createDirectorDto, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-all')
  findAll(@Req() req) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.directorService.findAll(userId, userRole);
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
  update(@Param('id') id: string, @Body() updateDirectorDto: UpdateDirectorDto, @Req() req) {
    const userRole = req.user.role;
    return this.directorService.update(id, updateDirectorDto, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.directorService.remove(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('approve/:id')
  approve(@Param('id') id: string) {
    return this.directorService.approve(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('reject/:id')
  reject(@Param('id') id: strin