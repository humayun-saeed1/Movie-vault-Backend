import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { DirectorService } from './director.service.js';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { Roles } from '../auth/role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('director')
export class DirectorController {
  constructor(
    private readonly directorService: DirectorService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDirectorDto: CreateDirectorDto, 
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      createDirectorDto.imageURL = result.secure_url;
    }
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.directorService.create(createDirectorDto, userId, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-all')
  findAll(@Req() req, @Query() query: any) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.directorService.findAll(userId, userRole, query);
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
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string, 
    @Body() updateDirectorDto: UpdateDirectorDto, 
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      updateDirectorDto.imageURL = result.secure_url;
    }
    const userRole = req.user.role;
    return this.directorService.update(id, updateDirectorDto, userRole);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.directorService.remove(id, req.user);
  }


}
