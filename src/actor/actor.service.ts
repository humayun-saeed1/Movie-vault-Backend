import { Injectable } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ActorService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createActorDto: CreateActorDto) {
    try {
      const { movieID, ...actorData } = createActorDto;

      return this.prisma.actors.create({
        data: {
          ...actorData,
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


  async findAll() {
    return this.prisma.actors.findMany({
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

  async update(id: string, updateActorDto: UpdateActorDto) {
    return this.prisma.actors.update({
      where: {
        id
      },
      data: updateActorDto
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
