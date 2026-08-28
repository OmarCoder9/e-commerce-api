import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use(helmet())
  app.enableCors();

  const swagger = new DocumentBuilder()
    .setTitle('Nestjs E-commerce API')
    .setDescription('E-Commrece API')
    .addServer("http://localhost:3000")
    .setVersion('1.0')
    .addSecurity("bearer", {type:"http", scheme:"bearer"})
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api-docs', app, documentation);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
