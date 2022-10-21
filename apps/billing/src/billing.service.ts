import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  getHello(): string {
    return 'Hello World!';
  }

  createBill(data: any) {
    this.logger.log('Billing: create bill', data);
  }
}
