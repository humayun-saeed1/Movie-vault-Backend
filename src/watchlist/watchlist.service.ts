import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async toggle(movieId: string, userId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new NotFoundException("Movie not found");

    const existing = await this.prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (existing) {
      await this.prisma.watchlist.delete({
        where: { id: existing.id }
      });
      return { status: 'removed' };
    } else {
      await this.prisma.watchlist.create({
        data: {
          user: { connect: { id: userId } },
          movie: { connect: { id: movieId } }
        }
      });
      return { status: 'added' };
    }
  }

  async getMyWatchlist(userId: string) {
    const lists = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: {
          include: { actors: true, directors: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return lists.map(w => {
       const movie = w.movie;
       const reviews = movie.reviews;
       const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
       return { ...movie, averageRating: avgRating };
    });
  }
}
