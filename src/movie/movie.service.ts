import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { Status } from '#generated/prisma/index.js';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createMovieDto: CreateMovieDto, creatorId: string, role: string) {
    try {
      const { actorID, directorID, ...movieData } = createMovieDto;
      const status = role.toUpperCase() === 'ADMIN' ? Status.APPROVED : Status.PENDING;
      return await this.prisma.movie.create({
        data: {
          ...movieData,
          creator: {
            connect: { id: creatorId }
          },
          status,
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

  async findAll(userId: string, role: string) {
    let whereClause = {};
    if (role.toUpperCase() === 'ADMIN') {
      whereClause = {};
    } else if (role.toUpperCase() === 'EDITOR') {
      whereClause = {
        OR: [
          { status: Status.APPROVED },
          { createrId: userId }
        ]
      };
    } else {
      whereClause = { status: Status.APPROVED };
    }

    return this.prisma.movie.findMany({
      where: whereClause,
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

  async update(id: string, updateMovieDto: UpdateMovieDto, role: string) {
    const { actorID, directorID, ...movieData } = updateMovieDto;
    const status = role.toUpperCase() === 'ADMIN' ? Status.APPROVED : Status.PENDING;

    return this.prisma.movie.update({
      where: { id },
      data: {
        ...movieData,
        status,
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

  async approve(id: string) {
    return this.prisma.movie.update({
      where: { id },
      data: { status: Status.APPROVED }
    });
  }

  async reject(id: string) {
    return this.prisma.movie.update({
      where: { id },
      data: { status: Status.REJECTED }
    });
  }
}
