import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service.js';
import { FavouriteController } from './favourite.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [FavouriteController],
  providers: [FavouriteService, PrismaService],
})
export class FavouriteModule {}
