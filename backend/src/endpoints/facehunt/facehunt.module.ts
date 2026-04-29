import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FacehuntService } from './facehunt.service';
import { Facehunt, FacehuntSchema } from '../../models/facehunt.model';
import { FacehuntController } from './facehunt.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Facehunt.name, schema: FacehuntSchema }])
    ],
    providers: [ FacehuntService, JwtAuthGuard ],
    controllers: [FacehuntController],
    exports: [ FacehuntService ],
})

export class FacehuntModule {}
