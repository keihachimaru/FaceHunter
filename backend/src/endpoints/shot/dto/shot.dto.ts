import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateShotDTO {
    @IsBoolean()
    valid: boolean = false;

    @IsString()
    readonly author: string;

    @IsString()
    readonly game: string;

    @IsString()
    readonly target: string;

    @IsString()
    readonly image: string;
}

export class UpdateShotDTO {
    @IsNumber()
    readonly votes: number;
}
