import { Body, Controller, Post, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDTO) {
        console.log('Received register request', dto);
        return this.AuthService.register(dto);
    }
    
    @Post('login')
    async login(@Body() dto: LoginDTO) {
        return this.AuthService.login(dto);
    }

    @Get('session')
    async getSession(@Req() req: Request) {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedException('Missing token');
    
        // Bearer <token>
        const token = authHeader.split(' ')[1];
        return this.AuthService.getSession(token);
    }
}
