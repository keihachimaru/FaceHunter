import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShotService } from './shot.service';
import { Shot, ShotSchema } from '../../models/shot.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Shot.name, schema: ShotSchema }])
    ],
    providers: [ ShotService ],
    exports: [ ShotService ],
})

export class ShotModule {}
