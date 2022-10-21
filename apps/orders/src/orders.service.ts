import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from './constants/services';
import { CreateOrderRequestDto } from './dto/create-order-request';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(createOrderRequestDto: CreateOrderRequestDto) {
    // Create a mongodb session to use database transaction.
    const session = await this.ordersRepository.startTransaction();

    try {
      // Create an order in mongoDB and also pass the session.
      const order = await this.ordersRepository.create(createOrderRequestDto, {
        session,
      });

      /**
       * Convert billing client emit observeable to promise and await to resolve
       * it before commiting the mongoDB session.
       **/
      await lastValueFrom(
        this.billingClient.emit('order_created', { createOrderRequestDto }),
      );

      // Commit MongoDB session transaction to persist the data.
      await session.commitTransaction();
      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
  }

  async getOrders() {
    return await this.ordersRepository.find({});
  }
}
