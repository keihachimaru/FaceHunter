import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './role.service';
import { Role, RoleSchema } from '../../models/role.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])
    ],
    providers: [ RoleService ],
    exports: [ RoleService ],
})

export class RoleModule {}
