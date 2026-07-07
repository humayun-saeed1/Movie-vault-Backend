import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovieService } from './movie.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Post('create')
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.create(createMovieDto);
  }

  @Get('get-all')
  findAll() {
    return this.movieService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }
}
