import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller.js';
import { WatchlistService } from './watchlist.service.js';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let watchlistService: WatchlistService;

  const mockWatchlistService = {
    toggle: jest.fn(),
    getMyWatchlist: jest.fn(),
  };

  const mockJwtService = { verifyAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        { provide: WatchlistService, useValue: mockWatchlistService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
    watchlistService = module.get<WatchlistService>(WatchlistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('toggle', () => {
    it('should call watchlistService.toggle', async () => {
      const req = { user: { id: 'u1' } };
      mockWatchlistService.toggle.mockResolvedValue({ status: 'added' });
      
      const result = await controller.toggle('m1', req);
      expect(result).toEqual({ status: 'added' });
      expect(watchlistService.toggle).toHaveBeenCalledWith('m1', 'u1');
    });

    it('should bubble up exception from watchlistService.toggle', async () => {
      const req = { user: { id: 'u1' } };
      mockWatchlistService.toggle.mockRejectedValue(new Error('Toggle failed'));
      await expect(controller.toggle('m1', req)).rejects.toThrow('Toggle failed');
    });
  });

  describe('getMyWatchlist', () => {
    it('should call watchlistService.getMyWatchlist', async () => {
      const req = { user: { id: 'u1' } };
      mockWatchlistService.getMyWatchlist.mockResolvedValue([{ id: 'm1' }]);
      
      const result = await controller.getMyWatchlist(req);
      expect(result).toEqual([{ id: 'm1' }]);
      expect(watchlistService.getMyWatchlist).toHaveBeenCalledWith('u1');
    });

    it('should bubble up exception from watchlistService.getMyWatchlist', async () => {
      const req = { user: { id: 'u1' } };
      mockWatchlistService.getMyWatchlist.mockRejectedValue(new Error('Get failed'));
      await expect(controller.getMyWatchlist(req)).rejects.toThrow('Get failed');
    });
  });
});
