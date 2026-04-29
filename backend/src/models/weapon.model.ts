import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Weapon extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ default: 10 })
    capacity: number;

    @Prop({ default: 1.0 })
    reloadTime: number;

    @Prop({ default: 1.0 })
    zoom: number;

    @Prop()
    skin: string;

    @Prop()
    sound: string;
}

export const WeaponSchema = SchemaFactory.createForClass(Weapon);
