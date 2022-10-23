import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interface';
import { User } from './users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async login(user: User, response: Response) {
    const expires = this.tokenExpiryDate();
    const payload: TokenPayload = {
      userId: user?._id.toHexString(),
    };

    // Generate JWT access token.
    const token = this.jwtService.sign(payload);

    // Generate cookie on server to use by web server only with expiry.
    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  logout(response: Response): void {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  private tokenExpiryDate(): Date {
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get<number>('JWT_EXPIRATION'),
    );

    return expires;
  }
}
