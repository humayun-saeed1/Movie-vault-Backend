import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest } from '@jest/globals';

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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should toggle a movie in watchlist (add)', async () => {
    mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'movie1' });
    mockPrismaService.watchlist.findUnique.mockResolvedValue(null);
    mockPrismaService.watchlist.create.mockResolvedValue({ id: '1', userId: '123', movieId: 'movie1' });

    const res = await service.toggle('movie1', '123');
    expect(res).toEqual({ status: 'added' });
  });

  it('should toggle a movie in watchlist (remove)', async () => {
    mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'movie1' });
    mockPrismaService.watchlist.findUnique.mockResolvedValue({ id: '1', userId: '123', movieId: 'movie1' });
    mockPrismaService.watchlist.delete.mockResolvedValue({ id: '1' });

    const res = await service.toggle('movie1', '123');
    expect(res).toEqual({ status: 'removed' });
  });

  it('should get my watchlist', async () => {
    const list = [{ id: '1', movie: { title: 'Movie 1', reviews: [] } }];
    mockPrismaService.watchlist.findMany.mockResolvedValue(list);

    const res = await service.getMyWatchlist('123');
    expect(res).toEqual([{ title: 'Movie 1', averageRating: 0, reviews: [] }]);
  });
});
