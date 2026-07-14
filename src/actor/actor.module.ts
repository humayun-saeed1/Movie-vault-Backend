import { Module } from '@nestjs/common';
import { ActorService } from './actor.service.js';
import { ActorController } from './actor.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ActorController],
  providers: [ActorService, PrismaService],
})
export class ActorModule { }
