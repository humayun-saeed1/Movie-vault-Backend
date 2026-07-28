import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteController } from './favourite.controller.js';
import { FavouriteService } from './favourite.service.js';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('FavouriteController', () => {
  let controller: FavouriteController;
  let favouriteService: FavouriteService;

  const mockFavouriteService = {
    toggle: jest.fn(),
    getMyFavourites: jest.fn(),
  };

  const mockJwtService = { verifyAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouriteController],
      providers: [
        { provide: FavouriteService, useValue: mockFavouriteService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<FavouriteController>(FavouriteController);
    favouriteService = module.get<FavouriteService>(FavouriteService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('toggle', () => {
    it('should call favouriteService.toggle', async () => {
      const req = { user: { id: 'u1' } };
      mockFavouriteService.toggle.mockResolvedValue({ status: 'added' });
      
      const result = await controller.toggle('m1', req);
      expect(result).toEqual({ status: 'added' });
      expect(favouriteService.toggle).toHaveBeenCalledWith('m1', 'u1');
    });
  });

  describe('getMyFavourites', () => {
    it('should call favouriteService.getMyFavourites', async () => {
      const req = { user: { id: 'u1' } };
      mockFavouriteService.getMyFavourites.mockResolvedValue([{ id: 'm1' }]);
      
      const result = await controller.getMyFavourites(req);
      expect(result).toEqual([{ id: 'm1' }]);
      expect(favouriteService.getMyFavourites).toHaveBeenCalledWith('u1');
    });
  });
});
