import { Injectable } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Status } from '#generated/prisma/index.js';
@Injectable()
export class DirectorService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createDirectorDto: CreateDirectorDto, creatorId: string, role: string) {
    try {
      const { movieID, ...directorData } = createDirectorDto;
      const status = role.toUpperCase() === 'ADMIN' ? Status.APPROVED : Status.PENDING;

      return this.prisma.director.create({
        data: {
          ...directorData,
          creator: {
            connect: { id: creatorId }
          },
          status,
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

    return this.prisma.director.findMany(
      {
        where: whereClause,
        include: {
          movies: true
        }
      }
    );
  }

  async findOne(id: string) {
    return this.prisma.director.findUnique({
      include: {
        movies: true
      },
      where: { id },
    });
  }

  async update(id: string, updateDirectorDto: UpdateDirectorDto) {
    return this.prisma.director.update({
      where: { id },
      data: updateDirectorDto
    });
  }

  async remove(id: string) {
    return this.prisma.director.delete({
      where: { id }
    });
  }

  async approve(id: string) {
    return this.prisma.director.update({
      where: { id },
      data: { status: Status.APPROVED }
    });
  }

  async reject(id: string) {
    return this.prisma.director.update({
      where: { id },
      data: { status: Status.REJECTED }
    });
  }
}
