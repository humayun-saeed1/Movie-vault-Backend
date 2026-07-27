import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { MovieService } from './movie.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { Roles } from '../auth/role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('movie')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createMovieDto: CreateMovieDto, 
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      createMovieDto.posterURl = result.secure_url;
    }
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
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string, 
    @Body() updateMovieDto: UpdateMovieDto, 
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      updateMovieDto.posterURl = result.secure_url;
    }
    const userRole = req.user.role;
    return this.movieService.update(id, updateMovieDto, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.movieService.remove(id, req.user);
  }


}
