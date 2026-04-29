import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateUserDTO {
    @IsString()
    readonly username: string;

    @IsString()
    readonly email: string;

    @IsString()
    readonly password: string;
}

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    readonly name: string;

    @IsOptional()
    @IsString()
    readonly profilePic: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly comments: string[];

    @IsOptional()
    @IsString({ each: true })
    readonly likes: string[];

    @IsOptional()
    @IsString({ each: true })
    readonly messages: string[];

    @IsString()
    @IsOptional()
    readonly username: string;

    @IsOptional()
    @IsString()
    readonly email: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly friends: string[];

    @IsOptional()
    @IsNumber()
    readonly credits: number;

    @IsString()
    @IsOptional()
    readonly password: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly roles: string[];
}

export class AddFriendDTO {
    @IsString()
    friendId: string;
}
