import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {

    @ApiProperty({
        description: "Rating out of 10",
        minimum: 1,
        maximum: 10,
        default: 5,
        type: Number,
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    rating: number;

    @ApiProperty({
        description: "Comment for the review",
        type: String,
    })
    @IsString()
    comment: string;

    @ApiProperty({
        description: "Movie ID for the review",
        type: String,
    })
    @IsString()
    movieId: string;
}
