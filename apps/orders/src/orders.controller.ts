import { JwtAuthGuard } from '@app/common';
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(): Promise<Order[]> {
    return this.ordersService.getOrders();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async creatOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: any,
  ): Promise<Order> {
    this.logger.log('creatOrder:', req.user, createOrderDto);
    return await this.ordersService.createOrder(
      createOrderDto,
      req.cookies?.Authentication,
    );
  }
}
