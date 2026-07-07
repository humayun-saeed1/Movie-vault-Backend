import { Injectable } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable()
export class DirectorService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createDirectorDto: CreateDirectorDto) {
    try {
      const { movieID, ...directorData } = createDirectorDto;

      return this.prisma.director.create({
        data: {
          ...directorData,
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

  async findAll() {
    return this.prisma.director.findMany(
      {
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
}
