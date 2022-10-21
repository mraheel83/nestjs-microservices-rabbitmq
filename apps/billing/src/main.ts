import { RabbitmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { BillingModule } from './billing.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);

  // Connect RabbitMQ microservice with "RABBIT_MQ_BILLING_QUEUE" queue to listen the messages.
  const rabbitmqService = app.get(RabbitmqService);
  app.connectMicroservice(rabbitmqService.getOptions('BILLING'));

  await app.startAllMicroservices();
}
bootstrap();
