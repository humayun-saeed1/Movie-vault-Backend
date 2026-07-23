import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createMovieDto: CreateMovieDto, creatorId: string, role: string) {
    try {
      const { actorID, directorID, ...movieData } = createMovieDto;
      return await this.prisma.movie.create({
        data: {
          ...movieData,
          creator: {
            connect: { id: creatorId }
          },

          actors: actorID ? {
            connect: actorID?.map(id => ({ id })) || []
          } : undefined,
          directors: directorID ? {
            connect: directorID?.map(id => ({ id })) || []
          } : undefined

        }
      })
    }
    catch (error) {
      console.log("Error creating movie")
      console.log(error)
      throw error
    }
  }

  async findAll(userId: string, role: string, query: any = {}) {
    const { search, sortBy, sortOrder = 'asc', genre, director, actor, year, page, limit } = query;
    let whereClause: any = {};

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }
    if (year) {
      whereClause.releaseyear = parseInt(year);
    }
    if (genre) {
      whereClause.genre = { contains: genre, mode: 'insensitive' };
    }
    if (director) {
      whereClause.directors = { some: { name: { contains: director, mode: 'insensitive' } } };
    }
    if (actor) {
      whereClause.actors = { some: { name: { contains: actor, mode: 'insensitive' } } };
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy === 'year') {
      orderByClause = { releaseyear: sortOrder };
    } else if (sortBy === 'title') {
      orderByClause = { name: sortOrder };
    }

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;

    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      skip = (pageNumber - 1) * limitNumber;
      take = limitNumber;
    }

    // If sorting by rating, we have to fetch all, sort in memory, and then paginate manually.
    if (sortBy === 'rating') {
      const allMovies = await this.prisma.movie.findMany({
        where: whereClause,
        include: { actors: true, directors: true, reviews: { select: { rating: true } } },
      });

      const moviesWithRating = allMovies.map(movie => {
        const avg = movie.reviews.length > 0 
          ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length 
          : 0;
        return { ...movie, averageRating: avg };
      });

      moviesWithRating.sort((a, b) => {
        return sortOrder === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating;
      });

      const total = moviesWithRating.length;
      let paginated = moviesWithRating;
      if (skip !== undefined && take !== undefined) {
        paginated = moviesWithRating.slice(skip, skip + take);
      }

      if (page && limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        return {
          movies: paginated,
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        };
      }
      return paginated;
    } else {
      // Normal query
      const [movies, total] = await Promise.all([
        this.prisma.movie.findMany({
          where: whereClause,
          orderBy: orderByClause,
          include: { actors: true, directors: true, reviews: { select: { rating: true } } },
          skip,
          take
        }),
        this.prisma.movie.count({ where: whereClause })
      ]);

      const moviesWithRating = movies.map(movie => {
        const avg = movie.reviews.length > 0 
          ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length 
          : 0;
        return { ...movie, averageRating: avg };
      });

      if (page && limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        return {
          movies: moviesWithRating,
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        };
      }

      return moviesWithRating;
    }
  }

  async findOne(id: string) {
    return this.prisma.movie.findUnique({
      where: { id },
      include: {
        actors: true,
        directors: true,
        reviews: {
          include: {
            user: { select: { id: true, username: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async update(id: string, updateMovieDto: UpdateMovieDto, role: string) {
    const { actorID, directorID, ...movieData } = updateMovieDto;

    return this.prisma.movie.update({
      where: { id },
      data: {
        ...movieData,

        actors: actorID ? {
          set: actorID.map(id => ({ id }))
        } : undefined,
        directors: directorID ? {
          set: directorID.map(id => ({ id }))
        } : undefined
      }
    });
  }

  async remove(id: string, user: any) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Movie not found');
    
    if (user.role === 'EDITOR' && movie.createrId !== user.id) {
      throw new UnauthorizedException('You can only delete your own created movies');
    }

    return this.prisma.movie.delete({
      where: { id }
    });
  }


}
