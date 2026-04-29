import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Facehunt extends Document {
    @Prop()
    name?: string;

    @Prop({ required: true, type: Types.ObjectId })
    author: string;

    @Prop({ required: true, type: Types.ObjectId })
    game: string;

    @Prop({ required: true, type: Types.ObjectId })
    image: string;
}

export const FacehuntSchema = SchemaFactory.createForClass(Facehunt);
