import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    /**
     * Reason to use forRoot because forRootAsync wasn't able to connect
     * to mongo replica-set asynchronically.
     */
    MongooseModule.forRoot('mongodb://root:password123@mongodb-primary:27017/'),
  ],
})
export class DatabaseModule {}
