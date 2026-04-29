import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BulletService } from './bullet.service';
import { Bullet, BulletSchema } from '../../models/bullet.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Bullet.name, schema: BulletSchema }])
    ],
    providers: [ BulletService ],
    exports: [ BulletService ],
})

export class BulletModule {}
