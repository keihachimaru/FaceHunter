import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamemodeService } from './gamemode.service';
import { Gamemode, GamemodeSchema } from '../../models/gamemode.model';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GamemodeController } from './gamemode.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Gamemode.name, schema: GamemodeSchema }])
    ],
    providers: [ GamemodeService, JwtAuthGuard ],
    controllers: [GamemodeController],
    exports: [ GamemodeService ],
})

export class GamemodeModule {}
