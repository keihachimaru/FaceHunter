import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateGameDTO {
    @IsString()
    readonly gameType: string;
}

export class UpdateGameDTO {
    @IsOptional()
    @IsString()
    readonly gameType: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    players: string[];

    @IsOptional()
    @IsBoolean()
    readonly ended: boolean;
}
