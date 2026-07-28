import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectorService } from './director.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';

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
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DirectorService>(DirectorService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a director without movies', async () => {
      const dto: CreateDirectorDto = { name: 'Director', age: 40, about: 'Bio', imageURL: 'url', movieID: [] };
      mockPrismaService.director.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto, 'user1', 'ADMIN');
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockPrismaService.director.create).toHaveBeenCalledWith({
        data: {
          name: 'Director',
          age: 40,
          about: 'Bio',
          imageURL: 'url',
          creator: { connect: { id: 'user1' } },
        },
      });
    });

    it('should create a director with movies', async () => {
      const dto: CreateDirectorDto = { name: 'Director', age: 40, about: 'Bio', imageURL: 'url', movieID: ['m1'] };
      await service.create(dto, 'user1', 'ADMIN');
      expect(mockPrismaService.director.create).toHaveBeenCalledWith({
        data: {
          name: 'Director',
          age: 40,
          about: 'Bio',
          imageURL: 'url',
          creator: { connect: { id: 'user1' } },
          movies: { connect: [{ id: 'm1' }] },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all directors without pagination', async () => {
      mockPrismaService.director.findMany.mockResolvedValue([{ id: '1', name: 'Director 1' }]);
      mockPrismaService.director.count.mockResolvedValue(1);

      const result = await service.findAll('user1', 'ADMIN', { search: 'Dir' });
      expect(result).toEqual([{ id: '1', name: 'Director 1' }]);
      expect(mockPrismaService.director.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: 'Dir', mode: 'insensitive' } } })
      );
    });

    it('should return paginated directors', async () => {
      mockPrismaService.director.findMany.mockResolvedValue([{ id: '1', name: 'Director 1' }]);
      mockPrismaService.director.count.mockResolvedValue(1);

      const result = await service.findAll('user1', 'ADMIN', { page: '1', limit: '10' });
      expect(result).toEqual({
        directors: [{ id: '1', name: 'Director 1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single director', async () => {
      mockPrismaService.director.findUnique.mockResolvedValue({ id: '1', name: 'Director' });
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1', name: 'Director' });
    });
  });

  describe('update', () => {
    it('should update a director', async () => {
      const dto: UpdateDirectorDto = { name: 'Updated' };
      mockPrismaService.director.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', dto, 'ADMIN');
      expect(result).toEqual({ id: '1', name: 'Updated' });
      expect(mockPrismaService.director.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated', movies: undefined },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if director not found', async () => {
      mockPrismaService.director.findUnique.mockResolvedValue(null);
      await expect(service.remove('1', { id: 'u1', role: 'ADMIN' })).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if EDITOR tries to delete someone elses director', async () => {
      mockPrismaService.director.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      await expect(service.remove('1', { id: 'u1', role: 'EDITOR' })).rejects.toThrow(UnauthorizedException);
    });

    it('should delete director if ADMIN', async () => {
      mockPrismaService.director.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      mockPrismaService.director.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', { id: 'u1', role: 'ADMIN' });
      expect(result).toEqual({ id: '1' });
    });

    it('should delete director if EDITOR and creator matches', async () => {
      mockPrismaService.director.findUnique.mockResolvedValue({ id: '1', createrId: 'u1' });
      mockPrismaService.director.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', { id: 'u1', role: 'EDITOR' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
