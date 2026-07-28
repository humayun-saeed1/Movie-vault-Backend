import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller.js';
import { WatchlistService } from './watchlist.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { jest } from '@jest/globals';

describe('WatchlistController', () => {
  let controller: WatchlistController;

  const mockWatchlistService = {
    toggle: jest.fn(),
    getMyWatchlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        }
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });

  it('should toggle a movie in watchlist', async () => {
    const response = { status: 'added' };
    mockWatchlistService.toggle.mockResolvedValue(response);
    const fakeReq = { user: { id: '123' } };
    
    const result = await controller.toggle('movie1', fakeReq);
    expect(result).toEqual(response);
  });

  it('should get my watchlist', async () => {
    const list = [{ id: '1' }];
    mockWatchlistService.getMyWatchlist.mockResolvedValue(list);
    const fakeReq = { user: { id: '123' } };
    
    const result = await controller.getMyWatchlist(fakeReq, {});
    expect(result).toEqual(list);
  });
});
