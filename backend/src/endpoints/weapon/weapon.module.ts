import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeaponService } from './weapon.service';
import { Weapon, WeaponSchema } from '../../models/weapon.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Weapon.name, schema: WeaponSchema }])
    ],
    providers: [ WeaponService ],
    exports: [ WeaponService ],
})

export class WeaponModule {}
