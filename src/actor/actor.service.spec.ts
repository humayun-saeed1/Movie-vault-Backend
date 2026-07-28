import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ActorService } from './actor.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';

describe('ActorService', () => {
  let service: ActorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    actors: {
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
        ActorService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ActorService>(ActorService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an actor without movies', async () => {
      const dto: CreateActorDto = { name: 'Actor', age: 30, about: 'Bio', imageURL: 'url', movieID: [] };
      mockPrismaService.actors.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto, 'user1', 'ADMIN');
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockPrismaService.actors.create).toHaveBeenCalledWith({
        data: {
          name: 'Actor',
          age: 30,
          about: 'Bio',
          imageURL: 'url',
          creator: { connect: { id: 'user1' } },
        },
      });
    });

    it('should create an actor with movies', async () => {
      const dto: CreateActorDto = { name: 'Actor', age: 30, about: 'Bio', imageURL: 'url', movieID: ['m1'] };
      await service.create(dto, 'user1', 'ADMIN');
      expect(mockPrismaService.actors.create).toHaveBeenCalledWith({
        data: {
          name: 'Actor',
          age: 30,
          about: 'Bio',
          imageURL: 'url',
          creator: { connect: { id: 'user1' } },
          movies: { connect: [{ id: 'm1' }] },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all actors without pagination', async () => {
      mockPrismaService.actors.findMany.mockResolvedValue([{ id: '1', name: 'Actor 1' }]);
      mockPrismaService.actors.count.mockResolvedValue(1);

      const result = await service.findAll('user1', 'ADMIN', { search: 'Actor' });
      expect(result).toEqual([{ id: '1', name: 'Actor 1' }]);
      expect(mockPrismaService.actors.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: 'Actor', mode: 'insensitive' } } })
      );
    });

    it('should return paginated actors', async () => {
      mockPrismaService.actors.findMany.mockResolvedValue([{ id: '1', name: 'Actor 1' }]);
      mockPrismaService.actors.count.mockResolvedValue(1);

      const result = await service.findAll('user1', 'ADMIN', { page: '1', limit: '10' });
      expect(result).toEqual({
        actors: [{ id: '1', name: 'Actor 1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single actor', async () => {
      mockPrismaService.actors.findUnique.mockResolvedValue({ id: '1', name: 'Actor' });
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1', name: 'Actor' });
    });
  });

  describe('update', () => {
    it('should update an actor', async () => {
      const dto: UpdateActorDto = { name: 'Updated' };
      mockPrismaService.actors.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', dto, 'ADMIN');
      expect(result).toEqual({ id: '1', name: 'Updated' });
      expect(mockPrismaService.actors.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated', movies: undefined },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if actor not found', async () => {
      mockPrismaService.actors.findUnique.mockResolvedValue(null);
      await expect(service.remove('1', { id: 'u1', role: 'ADMIN' })).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if EDITOR tries to delete someone elses actor', async () => {
      mockPrismaService.actors.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      await expect(service.remove('1', { id: 'u1', role: 'EDITOR' })).rejects.toThrow(UnauthorizedException);
    });

    it('should delete actor if ADMIN', async () => {
      mockPrismaService.actors.findUnique.mockResolvedValue({ id: '1', createrId: 'u2' });
      mockPrismaService.actors.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', { id: 'u1', role: 'ADMIN' });
      expect(result).toEqual({ id: '1' });
    });

    it('should delete actor if EDITOR and creator matches', async () => {
      mockPrismaService.actors.findUnique.mockResolvedValue({ id: '1', createrId: 'u1' });
      mockPrismaService.actors.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', { id: 'u1', role: 'EDITOR' });
      expect(result).toEqual({ id: '1' });
    });
  });
});
