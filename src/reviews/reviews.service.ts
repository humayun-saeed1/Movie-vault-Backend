import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) { }

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const { movieId, rating, comment } = createReviewDto;

    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException("Movie not found");
    }

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        movie: { connect: { id: movieId } },
        user: { connect: { id: userId } }
      }
    });
  }

  async findForSingleMovie(userId: string, movieId: string) {
    const aggregate = await this.prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      where: { 
        movieId: movieId 
      },
    });

    const avg_rating = aggregate._avg.rating;
    
    if (avg_rating === null) {
      throw new NotFoundException("Movie is not rated yet");
    }

    return { avg_rating };
  }

  async findByMovieId(movieId: string) {
    return this.prisma.review.findMany({
      where: { movieId },
      include: {
        user: {
          select: { id: true, username: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: string, userId: string, role: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException("Review not found");

    if (review.userId !== userId && role !== 'ADMIN') {
      throw new NotFoundException("Unauthorized to delete this review");
    }

    return this.prisma.review.delete({
      where: { id }
    });
  }
}
