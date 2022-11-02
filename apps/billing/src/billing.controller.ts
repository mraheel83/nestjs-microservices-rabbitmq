import { JwtAuthGuard, RabbitmqService } from '@app/common';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BillingService } from './billing.service';

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.billingService.getHello();
  }

  @EventPattern('order_created')
  @UseGuards(JwtAuthGuard)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.billingService.createBill(data);

    // Acknowledge RabbitMQ message manually to remove from the queue.
    this.rabbitmqService.ack(context);
  }
}
