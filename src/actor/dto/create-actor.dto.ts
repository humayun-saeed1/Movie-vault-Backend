import { IsString, IsOptional, IsInt, IsPositive, Max, IsArray } from 'class-validator';
export class CreateActorDto {
    @IsString()
    name: string;
    @IsInt()
    @IsPositive()
    @Max(100)
    age: number;
    @IsString()
    about: string;
    @IsString()
    @IsOptional()
    imageURL: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    movieID: string[];
}
