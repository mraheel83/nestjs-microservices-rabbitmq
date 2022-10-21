import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqModuleOptions } from './interface/options.interface';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {
  /**
   * Convert static module to dynamic module so we can import and export a customised
   * ClientsModule by creating a static register method.
   **/
  static register({ name }: RabbitmqModuleOptions): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        // Use NestJs microservice ClientsModule to register clients (RabbitMQ client).
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBIT_MQ_URI')],
                queue: configService.get<string>(`RABBIT_MQ_${name}_QUEUE`),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
