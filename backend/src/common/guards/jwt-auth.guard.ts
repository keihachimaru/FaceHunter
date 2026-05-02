import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if(!authHeader) return false;
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = { id: decoded.sub };
            return true;
        }
        catch {
            return false;
        }
    }
}
