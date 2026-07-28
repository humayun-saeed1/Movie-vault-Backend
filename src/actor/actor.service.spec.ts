import { Test, TestingModule } from '@nestjs/testing';
import { ActorService } from './actor.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { jest } from '@jest/globals';

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
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<ActorService>(ActorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an actor', async () => {
    const actorData = { name: 'Actor 1', movieID: ['1'] } as any;
    const result = { id: '1', name: 'Actor 1' };
    mockPrismaService.actors.create.mockResolvedValue(result);

    const res = await service.create(actorData, '123', 'ADMIN');
    expect(res).toEqual(result);
  });

  it('should find all actors', async () => {
    const actors = [{ id: '1', name: 'Actor 1' }];
    mockPrismaService.actors.findMany.mockResolvedValue(actors);
    mockPrismaService.actors.count.mockResolvedValue(1);

    const res = await service.findAll('123', 'ADMIN', { search: 'Act' });
    expect(res).toEqual(actors);
  });

  it('should find one actor', async () => {
    const actor = { id: '1', name: 'Actor 1' };
    mockPrismaService.actors.findUnique.mockResolvedValue(actor);

    const res = await service.findOne('1');
    expect(res).toEqual(actor);
  });

  it('should update an actor', async () => {
    const actor = { id: '1', name: 'Updated Actor' };
    mockPrismaService.actors.update.mockResolvedValue(actor);

    const res = await service.update('1', { name: 'Updated Actor', movieID: [] } as any, 'ADMIN');
    expect(res).toEqual(actor);
  });

  it('should remove an actor', async () => {
    const actor = { id: '1', createrId: '123' };
    mockPrismaService.actors.findUnique.mockResolvedValue(actor);
    mockPrismaService.actors.delete.mockResolvedValue(actor);

    const res = await service.remove('1', { id: '123', role: 'EDITOR' });
    expect(res).toEqual(actor);
  });
});
