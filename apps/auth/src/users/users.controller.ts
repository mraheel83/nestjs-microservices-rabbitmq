import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateUserDto } from './dto/craete-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }
}
