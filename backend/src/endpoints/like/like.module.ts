import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import { Like, LikeSchema } from '../../models/like.model';
import { LikeController } from './like.controller';
import { FacehuntModule } from '../facehunt/facehunt.module';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
        FacehuntModule,
        UserModule,
    ],
    providers: [ LikeService, JwtAuthGuard ],
    controllers: [ LikeController ],
    exports: [ LikeService ],
})

export class LikeModule {}
