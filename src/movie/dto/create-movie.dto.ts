import { IsString, IsInt, Min, Max, IsPositive, IsOptional, IsArray } from "class-validator";

export class CreateMovieDto {

    @IsString()
    name: string;

    @IsInt()
    @Min(1888)
    @Max(new Date().getFullYear())
    releaseyear: number;

    @IsInt()
    @IsPositive()
    duration: number;

    @IsString()
    genre: string;

    @IsString()
    trailerURL: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    actorID: string[];

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    directorID: string[];

}
