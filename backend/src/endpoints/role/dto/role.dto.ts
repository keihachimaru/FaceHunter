import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRoleDTO {
    @IsNumber()
    readonly baseHP: number;

    @IsString()
    readonly name: string;
}

export class UpdateRoleDTO {
    @IsNumber()
    readonly baseHP: number;
}
