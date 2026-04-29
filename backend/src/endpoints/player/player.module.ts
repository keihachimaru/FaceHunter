import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from '../../models/player.model';
import { PlayerController } from './player.controller';
import { BulletModule } from '../bullet/bullet.module';
import { WeaponModule } from '../weapon/weapon.module';
import { UploadService } from '../cloudinary/upload.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GameModule } from '../game/game.module';
import { ShotModule } from '../shot/shot.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
        BulletModule,
        WeaponModule,
        ShotModule,
        forwardRef(() => GameModule),
    ],
    controllers: [ PlayerController ],
    providers: [ PlayerService, UploadService ],
    exports: [ PlayerService ],
})

export class PlayerModule {}
