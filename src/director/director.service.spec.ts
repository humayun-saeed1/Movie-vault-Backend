import { Test, TestingModule } from '@nestjs/testing';
import { DirectorService } from './director.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest } from '@jest/globals';

describe('DirectorService', () => {
  let service: DirectorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    director: {
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
        DirectorService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<DirectorService>(DirectorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a director', async () => {
    const directorData = { name: 'Director 1' } as any;
    const result = { id: '1', name: 'Director 1' };
    mockPrismaService.director.create.mockResolvedValue(result);

    const res = await service.create(directorData, '123', 'ADMIN');
    expect(res).toEqual(result);
  });

  it('should find all directors', async () => {
    const directors = [{ id: '1', name: 'Director 1' }];
    mockPrismaService.director.findMany.mockResolvedValue(directors);
    mockPrismaService.director.count.mockResolvedValue(1);

    const res = await service.findAll('123', 'ADMIN', { search: 'dir' });
    expect(res).toEqual(directors);
  });

  it('should find one director', async () => {
    const director = { id: '1', name: 'Director 1' };
    mockPrismaService.director.findUnique.mockResolvedValue(director);

    const res = await service.findOne('1');
    expect(res).toEqual(director);
  });

  it('should update a director', async () => {
    const director = { id: '1', name: 'Updated Director' };
    mockPrismaService.director.update.mockResolvedValue(director);

    const res = await service.update('1', { name: 'Updated Director' } as any, 'ADMIN');
    expect(res).toEqual(director);
  });

  it('should remove a director', async () => {
    const director = { id: '1', createrId: '123' };
    mockPrismaService.director.findUnique.mockResolvedValue(director);
    mockPrismaService.director.delete.mockResolvedValue(director);

    const res = await service.remove('1', { id: '123', role: 'EDITOR' });
    expect(res).toEqual(director);
  });
});
