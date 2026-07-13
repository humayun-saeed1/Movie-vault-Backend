
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    identity: string; // This holds whatever the user types: their email OR their username

    @IsString()
    @IsNotEmpty()
    password: string;
}