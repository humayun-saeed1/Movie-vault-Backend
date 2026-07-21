import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { WatchlistService } from './watchlist.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @UseGuards(AuthGuard)
  @Post('toggle/:movieId')
  toggle(@Param('movieId') movieId: string, @Req() req) {
    const userId = req.user.id || req.user.sub;
    return this.watchlistService.toggle(movieId, userId);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  getMyWatchlist(@Req() req) {
    const userId = req.user.id || req.user.sub;
    return this.watchlistService.getMyWatchlist(userId);
  }
}
