import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MovieModule } from './movie/movie.module.js';
import { ActorModule } from './actor/actor.module.js';
import { DirectorModule } from './director/director.module.js';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), MovieModule, ActorModule, DirectorModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
