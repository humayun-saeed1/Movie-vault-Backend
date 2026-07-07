import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createMovieDto: CreateMovieDto) {
    try {
      const { actorID, directorID, ...movieData } = createMovieDto;
      return await this.prisma.movie.create({
        data: {
          ...movieData,
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

  async findAll() {
    return this.prisma.movie.findMany({
      include: {
        actors: true,
        directors: true
      }
    })
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

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const { actorID, directorID, ...movieData } = updateMovieDto;
    return this.prisma.movie.update({
      where: { id },
      data: {
        ...movieData,
        actors: actorID ? {
          connect: actorID?.map(id => ({ id })) || []
        } : undefined,
        directors: directorID ? {
          connect: directorID?.map(id => ({ id })) || []
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
