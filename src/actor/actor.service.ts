import { Injectable } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ActorService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createActorDto: CreateActorDto, creatorId: string, role: string) {
    try {
      const { movieID, ...actorData } = createActorDto;

      return this.prisma.actors.create({
        data: {
          ...actorData,
          creator: {
            connect: { id: creatorId }
          },

          ...(movieID?.length && {
            movies: {
              connect: movieID.map((id: string) => ({ id }))
            }
          })
        }
      });
    }
    catch (error) {
      console.error(error);
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

    const [actors, total] = await Promise.all([
      this.prisma.actors.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { movies: true },
        skip,
        take
      }),
      this.prisma.actors.count({ where: whereClause })
    ]);

    if (page && limit) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      return {
        actors,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      };
    }

    return actors;
  }

  async findOne(id: string) {
    return this.prisma.actors.findUnique({
      include: {
        movies: true
      },
      where: {
        id
      }
    });
  }

  async update(id: string, updateActorDto: UpdateActorDto, role: string) {
    const { movieID, ...actorData } = updateActorDto;
    return this.prisma.actors.update({
      where: {
        id
      },
      data: {
        ...actorData,

        movies: movieID ? {
          set: movieID.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async remove(id: string) {
    return this.prisma.actors.delete({
      where: {
        id
      }
    });
  }


}
