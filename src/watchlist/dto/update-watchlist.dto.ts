import { PartialType } from '@nestjs/swagger';
import { CreateWatchlistDto } from './create-watchlist.dto.js';

export class UpdateWatchlistDto extends PartialType(CreateWatchlistDto) {}
