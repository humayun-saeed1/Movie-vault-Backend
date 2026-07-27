import { Module } from '@nestjs/common';
import { DirectorService } from './director.service.js';
import { DirectorController } from './director.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [DirectorController],
  providers: [DirectorService, PrismaService],
})
export class DirectorModule { }
