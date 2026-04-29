import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Gamemode extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    numRounds: number;

    @Prop()
    roundLength: number;

    @Prop({ default: false })
    teams: boolean;

    @Prop({ default: 0 })
    teamLimit: number;
}

export const GamemodeSchema = SchemaFactory.createForClass(Gamemode);
