import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteService } from './favourite.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('FavouriteService', () => {
  let service: FavouriteService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      findUnique: jest.fn(),
    },
    favourite: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouriteService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FavouriteService>(FavouriteService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggle', () => {
    it('should throw NotFoundException if movie does not exist', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue(null);
      await expect(service.toggle('m1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should delete from favourite if already exists', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.favourite.findUnique.mockResolvedValue({ id: 'f1' });
      mockPrismaService.favourite.delete.mockResolvedValue({ id: 'f1' });

      const result = await service.toggle('m1', 'u1');
      expect(result).toEqual({ status: 'removed' });
      expect(mockPrismaService.favourite.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    });

    it('should create to favourite if it does not exist', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.favourite.findUnique.mockResolvedValue(null);
      mockPrismaService.favourite.create.mockResolvedValue({ id: 'f1' });

      const result = await service.toggle('m1', 'u1');
      expect(result).toEqual({ status: 'added' });
      expect(mockPrismaService.favourite.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'u1' } },
          movie: { connect: { id: 'm1' } },
        }
      });
    });
  });

  describe('getMyFavourites', () => {
    it('should return favourited movies with average rating', async () => {
      const mockMovies = [
        { movie: { id: 'm1', name: 'Movie 1', reviews: [{ rating: 5 }] } }
      ];
      mockPrismaService.favourite.findMany.mockResolvedValue(mockMovies);
      
      const result = await service.getMyFavourites('u1');
      expect(result).toEqual([{ id: 'm1', name: 'Movie 1', reviews: [{ rating: 5 }], averageRating: 5 }]);
    });
  });
});
