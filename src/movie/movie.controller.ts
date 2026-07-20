import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { MovieService } from './movie.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { Roles } from '../auth/role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  create(@Body() createMovieDto: CreateMovieDto, @Req() req) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.movieService.create(createMovieDto, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-all')
  findAll(@Req() req, @Query() query: any) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.movieService.findAll(userId, userRole, query);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto, @Req() req) {
    const userRole = req.user.role;
    return this.movieService.update(id, updateMovieDto, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('approve/:id')
  approve(@Param('id') id: string) {
    return this.movieService.approve(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('reject/:id')
  reject(@Param('id') id: string) {
    return this.movieService.reject(id);
  }
}
