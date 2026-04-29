import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateGamemodeDTO {
    @IsString()
    readonly name: string;

    @IsNumber()
    readonly numRounds: number;

    @IsNumber()
    readonly roundLength: number;

    @IsBoolean()
    @IsOptional()
    readonly teams: boolean;

    @IsNumber()
    @IsOptional()
    readonly teamLimit: number;
}

export class UpdateGamemodeDTO {
    @IsString()
    @IsOptional()
    readonly name: string;

    @IsNumber()
    @IsOptional()
    readonly numRounds: number;

    @IsNumber()
    @IsOptional()
    readonly roundLength: number;

    @IsBoolean()
    @IsOptional()
    readonly teams: boolean;

    @IsNumber()
    @IsOptional()
    readonly teamLimit: number;
}
