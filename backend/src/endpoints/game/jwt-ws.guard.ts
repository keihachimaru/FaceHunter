import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
    
    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket>();
        const data = context.switchToWs().getData<{ token: string }>();
        const token = data?.token;
        if(!token) throw new UnauthorizedException('Missing token');

        try {
            const payload = this.jwtService.verify(token);
            client.data.player = { id: payload.id, gameId: payload.gameId };
            return true;
        }
        catch(e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
