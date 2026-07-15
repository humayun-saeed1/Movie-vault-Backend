
import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { Role } from '#generated/prisma/index.js';

export class RegisterDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsEnum(Role)
    role?: Role;
}