import { Test, TestingModule } from '@nestjs/testing';
import { ActorController } from './actor.controller.js';
import { ActorService } from './actor.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { jest } from '@jest/globals';

import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

describe('ActorController', () => {
  let controller: ActorController;
  
  const mockActorService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActorController],
      providers: [
        {
          provide: ActorService,
          useValue: mockActorService,
        },
        {
          provide: CloudinaryService,
          useValue: { uploadImage: jest.fn() },
        }
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ActorController>(ActorController);
  });

  it('should findAll actors', async () => {
    const actors = [
      { id: '1', name: 'Actor 1' },
      { id: '2', name: 'Actor 2' },
    ];
    mockActorService.findAll.mockResolvedValue(actors);
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const fakeQuery = {};
    const result = await controller.findAll(fakeReq, fakeQuery);
    expect(result).toEqual(actors);
  });

  it('should create an actor', async () => {
    const actor = { id: '1', name: 'Actor 1' };
    mockActorService.create.mockResolvedValue(actor);
    const fakeBody = { name: 'Actor 1' };
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.create(fakeBody, fakeReq);
    expect(result).toEqual(actor);
  });

  it('should find one actor by id', async () => {
    const actor = { id: '1', name: 'Actor 1' };
    mockActorService.findOne.mockResolvedValue(actor);
    const result = await controller.findOne('1');
    expect(result).toEqual(actor);
  });

  it('should update an actor', async () => {
    const actor = { id: '1', name: 'Actor 1' };
    mockActorService.update.mockResolvedValue(actor);
    const fakeBody = { name: 'Actor 1' };
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.update('1', fakeBody, fakeReq);
    expect(result).toEqual(actor);
  });

  it('should delete an actor', async () => {
    const actor = { id: '1', name: 'Actor 1' };
    mockActorService.remove.mockResolvedValue(actor);
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.remove(fakeReq, '1');
    expect(result).toEqual(actor);
  });
});
