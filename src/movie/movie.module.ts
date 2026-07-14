import { Module } from '@nestjs/common';
import { MovieService } from './movie.service.js';
import { MovieController } from './movie.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [MovieController],
  providers: [MovieService, PrismaService],
})
export class MovieModule {}
