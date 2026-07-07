import { Module } from '@nestjs/common';
import { DirectorService } from './director.service.js';
import { DirectorController } from './director.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Module({
  controllers: [DirectorController],
  providers: [DirectorService, PrismaService],
})
export class DirectorModule { }
