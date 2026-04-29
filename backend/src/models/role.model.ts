import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true, default: 100 })
    baseHP: number;
};

export const RoleSchema = SchemaFactory.createForClass(Role);
