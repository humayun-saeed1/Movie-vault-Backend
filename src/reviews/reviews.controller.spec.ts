import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  const mockReviewsService = {
    create: jest.fn(),
    findByMovieId: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = { verifyAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: mockReviewsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call reviewsService.create', async () => {
      const dto: CreateReviewDto = { movieId: 'm1', rating: 5, comment: 'good' };
      const req = { user: { id: 'u1' } };
      mockReviewsService.create.mockResolvedValue({ id: 'r1' });
      
      const result = await controller.create(dto, req);
      expect(result).toEqual({ id: 'r1' });
      expect(reviewsService.create).toHaveBeenCalledWith(dto, 'u1');
    });

    it('should bubble up exception from reviewsService.create', async () => {
      const dto: CreateReviewDto = { movieId: 'm1', rating: 5, comment: 'good' };
      const req = { user: { id: 'u1' } };
      mockReviewsService.create.mockRejectedValue(new Error('Create failed'));
      await expect(controller.create(dto, req)).rejects.toThrow('Create failed');
    });
  });

  describe('findByMovieId', () => {
    it('should call reviewsService.findByMovieId', async () => {
      mockReviewsService.findByMovieId.mockResolvedValue([{ id: 'r1' }]);
      const result = await controller.findByMovieId('m1');
      expect(result).toEqual([{ id: 'r1' }]);
      expect(reviewsService.findByMovieId).toHaveBeenCalledWith('m1');
    });

    it('should bubble up exception from reviewsService.findByMovieId', async () => {
      mockReviewsService.findByMovieId.mockRejectedValue(new Error('Find failed'));
      await expect(controller.findByMovieId('m1')).rejects.toThrow('Find failed');
    });
  });

  describe('remove', () => {
    it('should call reviewsService.remove', async () => {
      const req = { user: { id: 'u1', role: 'VIEWER' } };
      mockReviewsService.remove.mockResolvedValue({ id: 'r1' });
      
      const result = await controller.remove('r1', req);
      expect(result).toEqual({ id: 'r1' });
      expect(reviewsService.remove).toHaveBeenCalledWith('r1', 'u1', 'VIEWER');
    });

    it('should bubble up exception from reviewsService.remove', async () => {
      const req = { user: { id: 'u1', role: 'VIEWER' } };
      mockReviewsService.remove.mockRejectedValue(new Error('Remove failed'));
      await expect(controller.remove('r1', req)).rejects.toThrow('Remove failed');
    });
  });
});
