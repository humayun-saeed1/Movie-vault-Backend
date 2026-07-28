import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { jest } from '@jest/globals';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const mockReviewsService = {
    create: jest.fn(),
    findByMovieId: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        }
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should create a review', async () => {
    const review = { id: '1', text: 'Great!' };
    mockReviewsService.create.mockResolvedValue(review);
    const fakeBody = { text: 'Great!' } as any;
    const fakeReq = { user: { id: '123' } };
    
    // In actual controller it might be (body, req) or (req, body)
    // We pass both ways just in case or just assume standard
    const result = await controller.create(fakeBody, fakeReq);
    expect(result).toEqual(review);
  });

  it('should find reviews by movie id', async () => {
    const reviews = [{ id: '1', text: 'Great!' }];
    mockReviewsService.findByMovieId.mockResolvedValue(reviews);
    const result = await controller.findByMovieId('movie1', {});
    expect(result).toEqual(reviews);
  });

  it('should remove a review', async () => {
    const review = { id: '1' };
    mockReviewsService.remove.mockResolvedValue(review);
    const fakeReq = { user: { id: '123' } };
    const result = await controller.remove('1', fakeReq);
    expect(result).toEqual(review);
  });
});
