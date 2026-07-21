import { Injectable } from '@nestjs/common';
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

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: { actors: true, directors: true },
        skip,
        take
      }),
      this.prisma.movie.count({ where: whereClause })
    ]);

    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      return {
        movies,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      };
    }

    return movies;
  }

  async findOne(id: string) {
    return this.prisma.movie.findUnique({
      where: { id },
      include: {
        actors: true,
        directors: true
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

  async remove(id: string) {
    return this.prisma.movie.delete({
      where: { id }
    });
  }


}
