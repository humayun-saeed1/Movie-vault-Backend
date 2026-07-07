import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto.js';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
