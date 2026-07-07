import { Module } from '@nestjs/common';
import { ActorService } from './actor.service.js';
import { ActorController } from './actor.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [ActorController],
  providers: [ActorService, PrismaService],
})
export class ActorModule { }
