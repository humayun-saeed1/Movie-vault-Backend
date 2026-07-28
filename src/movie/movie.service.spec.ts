import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { jest } from '@jest/globals';

describe('MovieService', () => {
  let service: MovieService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn() } }
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a movie', async () => {
    const movieData = { name: 'Movie 1', actorID: ['1'], directorID: ['2'] } as any;
    const result = { id: '1', name: 'Movie 1' };
    mockPrismaService.movie.create.mockResolvedValue(result);

    const res = await service.create(movieData, '123', 'ADMIN');
    expect(res).toEqual(result);
  });

  it('should find all movies', async () => {
    const movies = [{ id: '1', name: 'Movie 1', reviews: [] }];
    mockPrismaService.movie.findMany.mockResolvedValue(movies);
    mockPrismaService.movie.count.mockResolvedValue(1);

    const res = await service.findAll('123', 'ADMIN', { search: 'Movie' });
    expect(res).toEqual([{ id: '1', name: 'Movie 1', averageRating: 0, reviews: [] }]);
  });

  it('should find one movie', async () => {
    const movie = { id: '1', name: 'Movie 1' };
    mockPrismaService.movie.findUnique.mockResolvedValue(movie);

    const res = await service.findOne('1');
    expect(res).toEqual(movie);
  });

  it('should update a movie', async () => {
    const movie = { id: '1', name: 'Updated Movie' };
    mockPrismaService.movie.update.mockResolvedValue(movie);

    const res = await service.update('1', { name: 'Updated Movie', actorID: [], directorID: [] } as any, 'ADMIN');
    expect(res).toEqual(movie);
  });

  it('should remove a movie', async () => {
    const movie = { id: '1', createrId: '123' };
    mockPrismaService.movie.findUnique.mockResolvedValue(movie);
    mockPrismaService.movie.delete.mockResolvedValue(movie);

    const res = await service.remove('1', { id: '123', role: 'EDITOR' });
    expect(res).toEqual(movie);
  });
});
