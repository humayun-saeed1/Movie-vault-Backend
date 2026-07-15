import { Injectable } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Status } from '#generated/prisma/index.js';

@Injectable()
export class ActorService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createActorDto: CreateActorDto, creatorId: string, role: string) {
    try {
      const { movieID, ...actorData } = createActorDto;
      const status = role.toUpperCase() === 'ADMIN' ? Status.APPROVED : Status.PENDING;

      return this.prisma.actors.create({
        data: {
          ...actorData,
          creator: {
            connect: { id: creatorId }
          },
          status,
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

    return this.prisma.actors.findMany({
      where: whereClause,
      include: {
        movies: true
      }
    });
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
    const status = role.toUpperCase() === 'ADMIN' ? Status.APPROVED : Status.PENDING;

    return this.prisma.actors.update({
      where: {
        id
      },
      data: {
        ...actorData,
        status,
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

  async approve(id: string) {
    return this.prisma.actors.update({
      where: { id },
      data: { status: Status.APPROVED }
    });
  }

  async reject(id: string) {
    return this.prisma.actors.update({
      where: { id },
      data: { status: Status.REJECTED }
    });
  }
}
