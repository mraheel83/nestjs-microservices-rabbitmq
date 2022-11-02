import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants/services';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    this.logger.log(authentication);

    return this.authClient
      .send('validate_user', {
        Authentication: authentication,
      })
      .pipe(
        tap((res) => {
          this.addUserToContext(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }

  /**
   * To get Authentication value that will be a JWT token.
   *
   * @param context
   * @returns
   */
  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .cookies?.Authentication;
    }
    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }
    return authentication;
  }

  /**
   * To attach user details to the execution context request (http) / data (rpc).
   *
   * @param user
   * @param context
   */
  private addUserToContext(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
