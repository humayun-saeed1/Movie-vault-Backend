import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if movie does not exist', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue(null);
      await expect(service.create({ movieId: 'm1', rating: 5, comment: 'good' }, 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should create a review if movie exists', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.review.create.mockResolvedValue({ id: 'r1' });
      
      const dto: CreateReviewDto = { movieId: 'm1', rating: 5, comment: 'good' };
      const result = await service.create(dto, 'u1');
      expect(result).toEqual({ id: 'r1' });
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
        data: {
          rating: 5,
          comment: 'good',
          movie: { connect: { id: 'm1' } },
          user: { connect: { id: 'u1' } },
        }
      });
    });
  });

  describe('findByMovieId', () => {
    it('should return empty array if no reviews found', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([]);
      const result = await service.findByMovieId('m1');
      expect(result).toEqual([]);
    });

    it('should return reviews for a movie', async () => {
      mockPrismaService.movie.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrismaService.review.findMany.mockResolvedValue([{ id: 'r1' }]);
      
      const result = await service.findByMovieId('m1');
      expect(result).toEqual([{ id: 'r1' }]);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if review does not exist', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      await expect(service.remove('r1', 'u1', 'VIEWER')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if viewer tries to delete someone elses review', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2' });
      await expect(service.remove('r1', 'u1', 'VIEWER')).rejects.toThrow(NotFoundException);
    });

    it('should delete review if ADMIN', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u2' });
      mockPrismaService.review.delete.mockResolvedValue({ id: 'r1' });
      
      const result = await service.remove('r1', 'u1', 'ADMIN');
      expect(result).toEqual({ id: 'r1' });
    });

    it('should delete review if viewer owns it', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'u1' });
      mockPrismaService.review.delete.mockResolvedValue({ id: 'r1' });
      
      const result = await service.remove('r1', 'u1', 'VIEWER');
      expect(result).toEqual({ id: 'r1' });
    });
  });
});
