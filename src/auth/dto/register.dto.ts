
import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}