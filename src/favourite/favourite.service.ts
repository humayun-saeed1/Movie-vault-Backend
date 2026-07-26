import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateAverageRating } from '../utils/movie.util.js';

@Injectable()
export class FavouriteService {
  constructor(private prisma: PrismaService) {}

  async toggle(movieId: string, userId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new NotFoundException("Movie not found");

    const existing = await this.prisma.favourite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (existing) {
      await this.prisma.favourite.delete({
        where: { id: existing.id }
      });
      return { status: 'removed' };
    } else {
      await this.prisma.favourite.create({
        data: {
          user: { connect: { id: userId } },
          movie: { connect: { id: movieId } }
        }
      });
      return { status: 'added' };
    }
  }

  async getMyFavourites(userId: string) {
    const favs = await this.prisma.favourite.findMany({
      where: { userId },
      include: {
        movie: {
          include: { actors: true, directors: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return favs.map(f => {
       const movie = f.movie;
       const avgRating = calculateAverageRating(movie.reviews);
       return { ...movie, averageRating: avgRating };
    });
  }
}
