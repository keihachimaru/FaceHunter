import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { Game, GameSchema } from '../../models/game.model';
import { JwtModule } from '@nestjs/jwt';
import { JwtWsGuard } from './jwt-ws.guard';
import { GameController } from './game.controller';
import { PlayerModule } from '../player/player.module';
import { UserModule } from '../user/user.module';
import { GamemodeModule } from '../gamemode/gamemode.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameGateway } from '../game/game.gateway';
import { ShotModule } from '../shot/shot.module';
import { FacehuntModule } from '../facehunt/facehunt.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
        PlayerModule,
        UserModule,
        ShotModule,
        GamemodeModule,
        FacehuntModule,
    ],
    controllers: [GameController],
    providers: [ GameService, JwtWsGuard, GameGateway, JwtAuthGuard ],
    exports: [ GameService, JwtWsGuard ],
})

export class GameModule {}
