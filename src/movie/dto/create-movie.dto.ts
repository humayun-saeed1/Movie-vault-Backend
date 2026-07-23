import { IsString, IsInt, Min, Max, IsPositive, IsOptional, IsArray } from "class-validator";
import { Transform } from "class-transformer";

export class CreateMovieDto {

    @IsString()
    name: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1888)
    @Max(new Date().getFullYear())
    releaseyear: number;

    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @IsPositive()
    duration: number;

    @IsString()
    genre: string;

    @IsString()
    trailerURL: string;

    @IsString()
    @IsOptional()
    posterURl: string;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch (e) { return [value]; }
        }
        return value;
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    actorID: string[];

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch (e) { return [value]; }
        }
        return value;
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    directorID: string[];

}
