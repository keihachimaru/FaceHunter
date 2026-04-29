import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Bullet extends Document {
    @Prop({ required: true, unique: true })
    name: string;
    
    @Prop({ default: 0 })
    price: number;

    @Prop({ default: 1.0})
    dmgMul: number;
}

export const BulletSchema = SchemaFactory.createForClass(Bullet);
