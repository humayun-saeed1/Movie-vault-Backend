import { IsString, IsOptional, IsInt, IsPositive, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDirectorDto {
    @IsString()
    name: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @IsPositive()
    @Max(100)
    age: number;

    @IsString()
    about: string;

    @IsString()
    @IsOptional()
    imageURL: string;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch (e) { return [value]; }
        }
        return value;
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    movieID: string[];
}
