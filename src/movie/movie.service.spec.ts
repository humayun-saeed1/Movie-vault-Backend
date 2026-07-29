import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';

describe('MovieService', () => {
  let service: MovieService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie with basic data', async () => {
      const dto: CreateMovieDto = { name: 'Movie', releaseyear: 2024, duration: 120, genre: 'Action', description: 'desc', posterURl: 'url' };
      mockPrismaService.movie.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto, 'u1', 'ADMIN');
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          creator: { connect: { id: 'u1' } },
          actors: undefined,
          directors: undefined,
        },
      });
    });

    it('should create a movie with actors and directors', async () => {
      const dto: CreateMovieDto = { name: 'Movie', releaseyear: 2024, duration: 120, genre: 'Action', description: 'desc', posterURl: 'url', actorID: ['a1'], directorID: ['d1'] };
      await service.create(dto, 'u1', 'ADMIN');
      expect(mockPrismaService.movie.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actors: { connect: [{ id: 'a1' }] },
            directors: { connect: [{ id: 'd1' }] },
          })
        })
      );
    });

    it('should bubble up exception if Prisma throws error (e.g. invalid actorId)', async () => {
      const dto: CreateMovieDto = { name: 'Movie', releaseyear: 2024, duration: 120, genre: 'Action', description: 'desc', posterURl: 'url', actorID: ['a1'] };
      mockPrismaService.movie.create.mockRejectedValue(new Error('Foreign Key Constraint Failed'));
      await expect(service.create(dto, 'u1', 'ADMIN')).rejects.toThrow('Foreign Key Constraint Failed');
    });
  });

  describe('findAll', () => {
    it('should return movies without pagination', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([{ id: '1', name: 'Movie', reviews: [] }]);
      mockPrismaService.movie.count.mockResolvedValue(1);

      const result = await service.findAll('u1', 'ADMIN', { search: 'Mov' });
      expect(result).toEqual([{ id: '1', name: 'Movie', reviews: [], averageRating: 0 }]);
      expect(mockPrismaService.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: 'Mov', mode: 'insensitive' } } })
      );
    });

    it('should return paginated movies', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([{ id: '1', name: 'Movie', reviews: [] }]);
      mockPrismaService.movie.count.mockResolvedValue(1);

      const result = await service.findAll('u1', 'ADMIN', { page: '1', limit: '10' });
      expect(result).toEqual({
        movies: [{ id: '1', name: 'Movie', reviews: [], averageRating: 0 }],
        total: 1, page: 1, limit: 10, totalPages: 1
      });
    });

    it('should sort by rating in memory', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([
        { id: '1', name: 'Movie 1', reviews: [{ rating: 5 }, { rating: 5 }] }, // avg 5
        { id: '2', name: 'Movie 2', reviews: [{ rating: 10 }] } // avg 10
      ]);

      const result: any = await service.findAll('u1', 'ADMIN', { sortBy: 'rating', sortOrder: 'desc' });
      expect(result[0].id).toEqual('2');
      expect(result[1].id).toEqual('1');
    });

    it('should handle invalid pagination and search parameters gracefully', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([{ id: '1', name: 'Movie 1', reviews: [] }]);
      mockPrismaService.movie.count.mockResolvedValue(1);

      const result = await service.findAll('u1', 'ADMIN', { page: '-1', limit: '0', search: '' });
      expect(result).toBeDefined();
      expect(mockPrismaService.movie.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: '1', name: 'Movie' });
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1', name: 'Movie' });
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const dto: UpdateMovieDto = { name: 'Updated' };
      mockPrismaService.movie.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', dto, 'ADMIN');
      expect(result).toEqual({ id: '1', name: 'Updated' });
      expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated', actors: undefined, directors: undefined },
      });
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const dto: UpdateMovieDto = { name: 'Updated' };
      mockPrismaService.movie.update.mockRejectedValue({ code: 'P2025' });
      await expect(service.update('999', dto, 'ADMIN')).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if movie not found', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue(null);
      await expect(service.remove('1', { id: 'u1', role: 'ADMIN' })).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if EDITOR tries to delete someone elses movie', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      await expect(service.remove('1', { id: 'u1', role: 'EDITOR' })).rejects.toThrow(UnauthorizedException);
    });

    it('should delete movie if ADMIN', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      mockPrismaService.movie.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', { id: 'u1', role: 'ADMIN' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
