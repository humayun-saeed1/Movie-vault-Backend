import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service.js';
import { WatchlistController } from './watchlist.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WatchlistController],
  providers: [WatchlistService, PrismaService],
})
export class WatchlistModule {}
