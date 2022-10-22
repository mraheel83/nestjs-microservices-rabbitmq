import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from './constants/services';
import { CreateOrderDto } from './dto/create-order';
import { OrdersRepository } from './repositories/orders.repository';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Create a mongodb session to use database transaction.
    const session = await this.ordersRepository.startTransaction();

    try {
      // Create an order in mongoDB and also pass the session.
      const order = await this.ordersRepository.create(createOrderDto, {
        session,
      });

      /**
       * Convert billing client emit observeable to promise and await to resolve
       * it before commiting the mongoDB session.
       **/
      await lastValueFrom(
        this.billingClient.emit('order_created', { createOrderDto }),
      );

      // Commit MongoDB transaction to persist the data.
      await session.commitTransaction();

      return order;
    } catch (err) {
      // Rollback transaction when anything went wrong
      await session.abortTransaction();
      throw err;
    }
  }

  async getOrders(): Promise<Order[]> {
    return await this.ordersRepository.find({});
  }
}
