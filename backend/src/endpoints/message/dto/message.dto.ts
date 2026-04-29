import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { MessageStatus } from '../../../models/message.model';

export class CreateMessageDTO {
    @IsString()
    readonly content: string; 

    @IsString()
    readonly sender: string;

    @IsString()
    readonly receipt: string;
}

export class UpdateMessageDTO {
   readonly status: MessageStatus; 
}
