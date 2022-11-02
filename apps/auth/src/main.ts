import { RabbitmqService } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rabbitmqService = app.get(RabbitmqService);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.connectMicroservice<RmqOptions>(rabbitmqService.getOptions('AUTH', true));

  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Auth hybrid app is listening on port: ${port}`);
}
bootstrap();
