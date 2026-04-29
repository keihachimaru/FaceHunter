import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateLikeDTO {
    @IsString()
    readonly author: string;

    @IsString()
    readonly facehunt: string;
}

export class UpdateLikeDTO {
    @IsBoolean()
    readonly value: boolean;
}
