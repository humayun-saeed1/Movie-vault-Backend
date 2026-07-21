import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteDto } from './create-favourite.dto.js';

export class UpdateFavouriteDto extends PartialType(CreateFavouriteDto) {}
