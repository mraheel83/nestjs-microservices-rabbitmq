import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderRequestDto } from './dto/create-order-request';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Post()
  creatOrder(@Body() createOrderRequestDto: CreateOrderRequestDto) {
    return this.ordersService.createOrder(createOrderRequestDto);
  }
}
