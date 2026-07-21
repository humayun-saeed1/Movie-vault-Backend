import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { FavouriteService } from './favourite.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @UseGuards(AuthGuard)
  @Post('toggle/:movieId')
  toggle(@Param('movieId') movieId: string, @Req() req) {
    const userId = req.user.id || req.user.sub;
    return this.favouriteService.toggle(movieId, userId);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  getMyFavourites(@Req() req) {
    const userId = req.user.id || req.user.sub;
    return this.favouriteService.getMyFavourites(userId);
  }
}
