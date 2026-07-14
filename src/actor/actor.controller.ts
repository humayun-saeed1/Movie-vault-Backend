import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ActorService } from './actor.service.js';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';
import { RoleGuard } from '../auth/role.guard.js'
import { Roles } from '../auth/role.decorator.js'

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) { }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Post('create')
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorService.create(createActorDto);
  }

  @Get('get-all')
  findAll() {
    return this.actorService.findAll();
  }

  @Get('get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.actorService.findOne(id);
  }
  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateActorDto: UpdateActorDto) {
    return this.actorService.update(id, updateActorDto);
  }
  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin', 'Editor')
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.actorService.remove(id);
  }
}
