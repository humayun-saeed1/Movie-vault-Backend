import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest } from '@jest/globals';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a review', async () => {
    const reviewData = { text: 'Great movie!', movieId: 'movie1' } as any;
    const result = { id: '1', text: 'Great movie!' };
    mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'movie1' });
    mockPrismaService.review.create.mockResolvedValue(result);

    const res = await service.create(reviewData, '123');
    expect(res).toEqual(result);
  });

  it('should find reviews by movie id', async () => {
    const reviews = [{ id: '1', text: 'Great movie!' }];
    mockPrismaService.review.findMany.mockResolvedValue(reviews);

    const res = await service.findByMovieId('movie1');
    expect(res).toEqual(reviews);
  });

  it('should remove a review', async () => {
    const review = { id: '1', userId: '123' };
    mockPrismaService.review.findUnique.mockResolvedValue(review);
    mockPrismaService.review.delete.mockResolvedValue(review);

    const res = await service.remove('1', '123', 'ADMIN');
    expect(res).toEqual(review);
  });
});
