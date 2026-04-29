import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtPayload } from 'jsonwebtoken';
import validator from 'validator';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async register(dto: RegisterDTO) {
        const existing = await this.userService.findByEmail( dto.email );
        if(existing) throw new BadRequestException('Email already in use');
        if(!validator.isEmail(dto.email)) {
            throw new BadRequestException('Invalid email address');
        }
        if (dto.username.length < 3) {
            throw new BadRequestException('Username must be at least 3 characters');
        }
        if (!validator.isStrongPassword(dto.password, {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0,
        })) {
          throw new BadRequestException('Password must be at least 6 characters and include letters and numbers');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userService.create({...dto, password: hashed});

        return { id: user._id, email: user.email };
    }

    async login(dto: LoginDTO) {
        const user = await this.userService.findByEmail( dto.email );
        if(!user) throw new NotFoundException('No account with this email');
        if(!user.password) throw new BadRequestException('User password is missing');

        const match = await bcrypt.compare(dto.password, user.password);
        if(!match) throw new UnauthorizedException('Invalid password');

        const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });

        return { token };
    }

    async getSession(token: string) {
        if (!token) throw new UnauthorizedException('Missing token');
    
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET not configured');
    
        try {
          // Verify and decode token
          const decoded = jwt.verify(token, secret) as JwtPayload;
    
          // Optional sanity check
          if (!decoded.sub) throw new UnauthorizedException('Malformed token');
    
          // Get fresh user data from DB
          const user = await this.userService.findById(decoded.sub);
          if (!user) throw new UnauthorizedException('User not found');
    
          // Return only what frontend actually needs
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            profilePic: user.profilePic ?? null,
          };
        } catch (err) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
}
