import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DirectorService } from './director.service.js';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';

@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) { }

  @Post('create')
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.create(createDirectorDto);
  }

  @Get('get-all')
  findAll() {
    return this.directorService.findAll();
  }

  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.directorService.findOne(id);
  }

  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateDirectorDto: UpdateDirectorDto) {
    return this.directorService.update(id, updateDirectorDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.directorService.remove(id);
  }
}
