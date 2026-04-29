import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtGuestGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
    
    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket>();
        const gameId = client.handshake.query.gameId as string;
        const token = client.handshake.auth.token as string;
        if (!gameId) {
            throw new BadRequestException('gameId is required');
        }

        if(!token) {
            //Is guest
            client.data.player = {
                id: undefined,
                gameId: gameId
            }
        }
        else {
            const payload = this.jwtService.verify(token);
            client.data.player = {
                id: payload.sub,
                gameId: gameId,
            }

        }

        return true;
    }
}
