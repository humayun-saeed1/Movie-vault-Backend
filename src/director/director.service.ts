import { Injectable } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable()
export class DirectorService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createDirectorDto: CreateDirectorDto, creatorId: string, role: string) {
    try {
      const { movieID, ...directorData } = createDirectorDto;
      return this.prisma.director.create({
        data: {
          ...directorData,
          creator: {
            connect: { id: creatorId }
          },

          ...(movieID?.length && {
            movies: {
              connect: movieID.map((id: string) => ({ id }))
            }
          })
        },
      });
    }
    catch (error) {
      console.log(error);
    }
  }

  async findAll(userId: string, role: string, query: any = {}) {
    const { search, page, limit } = query;
    let whereClause: any = {};

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;

    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      skip = (pageNumber - 1) * limitNumber;
      take = limitNumber;
    }

    const [directors, total] = await Promise.all([
      this.prisma.director.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { movies: true },
        skip,
        take
      }),
      this.prisma.director.count({ where: whereClause })
    ]);

    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      return {
        directors,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      };
    }

    return directors;
  }

  async findOne(id: string) {
    return this.prisma.director.findUnique({
      include: {
        movies: true
      },
      where: { id },
    });
  }

  async update(id: string, updateDirectorDto: UpdateDirectorDto, role: string) {
    const { movieID, ...directorData } = updateDirectorDto;
    return this.prisma.director.update({
      where: { id },
      data: {
        ...directorData,

        movies: movieID ? {
          set: movieID.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async remove(id: string) {
    return this.prisma.director.delete({
      where: { id }
    });
  }


}
