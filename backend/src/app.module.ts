import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { AuthModule } from './endpoints/auth/auth.module';
import { BulletModule } from './endpoints/bullet/bullet.module';
import { CommentModule } from './endpoints/comment/comment.module';
import { FacehuntModule } from './endpoints/facehunt/facehunt.module';
import { GameModule } from './endpoints/game/game.module';
import { GamemodeModule } from './endpoints/gamemode/gamemode.module';
import { LikeModule } from './endpoints/like/like.module';
import { MessageModule } from './endpoints/message/message.module';
import { PlayerModule } from './endpoints/player/player.module';
import { RoleModule } from './endpoints/role/role.module';
import { ShotModule } from './endpoints/shot/shot.module';
import { UserModule } from './endpoints/user/user.module';
import { WeaponModule } from './endpoints/weapon/weapon.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from './endpoints/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }), 
    AuthModule, 
    BulletModule, 
    CommentModule, 
    FacehuntModule,
    GameModule, 
    GamemodeModule,
    LikeModule, 
    MessageModule,
    PlayerModule, 
    RoleModule,
    ShotModule,
    UserModule,
    WeaponModule,
    JwtModule.register({
        global: true,
        secret: process.env.Jwt_SECRET,
        signOptions: { expiresIn: '1d' }
    }),
    CloudinaryModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
