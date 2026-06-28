import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

interface RequestWithAuth {
  headers: { authorization?: string };
  user?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: RequestWithAuth): string | undefined {
    const auth = request.headers.authorization;
    if (!auth) return undefined;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
