import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller.js';
import { DirectorService } from './director.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { jest } from '@jest/globals';

describe('DirectorController', () => {
  let controller: DirectorController;

  const mockDirectorService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorController],
      providers: [
        {
          provide: DirectorService,
          useValue: mockDirectorService,
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

    controller = module.get<DirectorController>(DirectorController);
  });

  it('should findAll directors', async () => {
    const directors = [
      { id: '1', name: 'Director 1' },
      { id: '2', name: 'Director 2' },
    ];
    mockDirectorService.findAll.mockResolvedValue(directors);
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const fakeQuery = {};
    const result = await controller.findAll(fakeReq, fakeQuery);
    expect(result).toEqual(directors);
  });

  it('should create a director', async () => {
    const director = { id: '1', name: 'Director 1' };
    mockDirectorService.create.mockResolvedValue(director);
    const fakeBody = { name: 'Director 1' } as any;
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.create(fakeBody, fakeReq);
    expect(result).toEqual(director);
  });

  it('should find one director by id', async () => {
    const director = { id: '1', name: 'Director 1' };
    mockDirectorService.findOne.mockResolvedValue(director);
    const result = await controller.findOne('1');
    expect(result).toEqual(director);
  });

  it('should update a director', async () => {
    const director = { id: '1', name: 'Director 1' };
    mockDirectorService.update.mockResolvedValue(director);
    const fakeBody = { name: 'Director 1' } as any;
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.update('1', fakeBody, fakeReq);
    expect(result).toEqual(director);
  });

  it('should delete a director', async () => {
    const director = { id: '1', name: 'Director 1' };
    mockDirectorService.remove.mockResolvedValue(director);
    const fakeReq = { user: { id: '123', role: 'ADMIN' } };
    const result = await controller.remove('1', fakeReq);
    expect(result).toEqual(director);
  });
});
