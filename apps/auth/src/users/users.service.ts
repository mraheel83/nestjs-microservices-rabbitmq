import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/craete-user.dto';
import { UsersRepository } from './users.repository';
import * as argon from 'argon2';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  private readonly logger = new Logger(UsersService.name);

  // Create new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    await this.isUserExists(createUserDto);

    return this.usersRepository.create({
      ...createUserDto,
      password: await argon.hash(createUserDto.password),
    });
  }

  // Get user details
  async getUser(userArgs: Partial<User>): Promise<User | null> {
    return await this.usersRepository.findOne(userArgs);
  }

  // Validate user credentials.
  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const isPasswordValid = await argon.verify(user?.password, password);

    if (!isPasswordValid)
      throw new UnauthorizedException('User credentials are not valid');

    return user;
  }

  // Check if user already exists in database.
  private async isUserExists(createUserDto: CreateUserDto) {
    let user: User;

    try {
      user = await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (err) {}

    if (user) {
      throw new UnprocessableEntityException(
        'User already exists with this email',
      );
    }
  }
}
