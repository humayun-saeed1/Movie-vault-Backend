import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const userId = req.user.id || req.user.sub;
    return this.reviewsService.create(createReviewDto, userId);
  }

  @Get('movie/:movieId')
  findByMovieId(@Param('movieId') movieId: string) {
    return this.reviewsService.findByMovieId(movieId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id || req.user.sub;
    const role = req.user.role;
    return this.reviewsService.remove(id, userId, role);
  }
}
