import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
import { CloudinaryModule } from './endpoints/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
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
    CloudinaryModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}