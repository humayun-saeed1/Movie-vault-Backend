import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      findUnique: jest.fn(),
    },
    watchlist: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
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

    it('should delete from watchlist if already exists', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.watchlist.findUnique.mockResolvedValue({ id: 'w1' });
      mockPrismaService.watchlist.delete.mockResolvedValue({ id: 'w1' });

      const result = await service.toggle('m1', 'u1');
      expect(result).toEqual({ status: 'removed' });
      expect(mockPrismaService.watchlist.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
    });

    it('should create to watchlist if it does not exist', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.watchlist.findUnique.mockResolvedValue(null);
      mockPrismaService.watchlist.create.mockResolvedValue({ id: 'w1' });

      const result = await service.toggle('m1', 'u1');
      expect(result).toEqual({ status: 'added' });
      expect(mockPrismaService.watchlist.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'u1' } },
          movie: { connect: { id: 'm1' } },
        }
      });
    });

    it('should bubble up error if Prisma throws during create (e.g. invalid userId)', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.watchlist.findUnique.mockResolvedValue(null);
      mockPrismaService.watchlist.create.mockRejectedValue(new Error('Prisma error'));

      await expect(service.toggle('m1', 'invalid-user')).rejects.toThrow('Prisma error');
    });
  });

  describe('getMyWatchlist', () => {
    it('should return watchlisted movies with average rating', async () => {
      const mockMovies = [
        { movie: { id: 'm1', name: 'Movie 1', reviews: [{ rating: 5 }] } }
      ];
      mockPrismaService.watchlist.findMany.mockResolvedValue(mockMovies);
      
      const result = await service.getMyWatchlist('u1');
      expect(result).toEqual([{ id: 'm1', name: 'Movie 1', reviews: [{ rating: 5 }], averageRating: 5 }]);
    });

    it('should return an empty array if the user has no movies in the watchlist', async () => {
      mockPrismaService.watchlist.findMany.mockResolvedValue([]);
      
      const result = await service.getMyWatchlist('u1');
      expect(result).toEqual([]);
    });

    it('should return movies with an averageRating of 0 if they have no reviews', async () => {
      const mockMovies = [
        { movie: { id: 'm1', name: 'Movie 1', reviews: [] } }
      ];
      mockPrismaService.watchlist.findMany.mockResolvedValue(mockMovies);
      
      const result = await service.getMyWatchlist('u1');
      expect(result).toEqual([{ id: 'm1', name: 'Movie 1', reviews: [], averageRating: 0 }]);
    });
  });
});
