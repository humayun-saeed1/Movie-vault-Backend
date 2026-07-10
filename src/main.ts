import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true
   }));
  
  const config = new DocumentBuilder()
    .setTitle('Movie Vault Single CRUD')
    .setDescription('Movie Table CRUD API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
 
  await app.listen(process.env.PORT ?? 8000);
  console.log(`Application is running on: http://localhost:8000`);
  console.log(`Swagger documentation available at: http://localhost:8000/api`);
}
bootstrap();
