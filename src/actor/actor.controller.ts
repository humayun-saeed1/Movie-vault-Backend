import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { ActorService } from './actor.service.js';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { Roles } from '../auth/role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('actor')
export class ActorController {
  constructor(
    private readonly actorService: ActorService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createActorDto: CreateActorDto, 
    @Req() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      createActorDto.imageURL = result.secure_url;
    }
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.actorService.create(createActorDto, userId, userRole);
  }


  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-all')
  findAll(@Req() req, @Query() query: any) {
    const userId = req.user.id || req.user.sub;
    const userRole = req.user.role;
    return this.actorService.findAll(userId, userRole, query);
  }
  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor', 'Viewer')
  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.actorService.findOne(id);
  }
  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Patch('edit/:id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string, 
    @Body() updateActorDto: UpdateActorDto, 
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type or upload failed.');
      });
      updateActorDto.imageURL = result.secure_url;
    }
    const userRole = req.user.role;
    return this.actorService.update(id, updateActorDto, userRole);
  }
  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.actorService.remove(id, req.user);
  }


}
