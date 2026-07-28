import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ActorController } from './actor.controller.js';
import { ActorService } from './actor.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateActorDto } from './dto/create-actor.dto.js';
import { UpdateActorDto } from './dto/update-actor.dto.js';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('ActorController', () => {
  let controller: ActorController;
  let actorService: ActorService;
  let cloudinaryService: CloudinaryService;

  const mockActorService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockJwtService = { verifyAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActorController],
      providers: [
        { provide: ActorService, useValue: mockActorService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ActorController>(ActorController);
    actorService = module.get<ActorService>(ActorService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateActorDto = { name: 'Actor', age: 30, about: 'Bio', imageURL: '', movieID: [] };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should create an actor without file upload', async () => {
      mockActorService.create.mockResolvedValue({ id: '1' });
      const result = await controller.create(dto, req, undefined);
      expect(result).toEqual({ id: '1' });
      expect(actorService.create).toHaveBeenCalledWith(dto, 'u1', 'ADMIN');
    });

    it('should upload file and create actor if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image.com' });
      mockActorService.create.mockResolvedValue({ id: '1' });

      await controller.create(dto, req, file);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(dto.imageURL).toEqual('http://image.com');
    });

    it('should throw BadRequestException if upload fails', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockRejectedValue(new Error('fail'));
      await expect(controller.create(dto, req, file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should call actorService.findAll', () => {
      mockActorService.findAll.mockReturnValue([]);
      const result = controller.findAll({ user: { id: 'u1', role: 'ADMIN' } }, {});
      expect(result).toEqual([]);
      expect(actorService.findAll).toHaveBeenCalledWith('u1', 'ADMIN', {});
    });
  });

  describe('findOne', () => {
    it('should call actorService.findOne', () => {
      mockActorService.findOne.mockReturnValue({ id: '1' });
      const result = controller.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    const dto: UpdateActorDto = { name: 'Actor 2' };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should update an actor without file upload', async () => {
      mockActorService.update.mockResolvedValue({ id: '1' });
      const result = await controller.update('1', dto, req, undefined);
      expect(result).toEqual({ id: '1' });
    });

    it('should upload file and update actor if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image2.com' });
      mockActorService.update.mockResolvedValue({ id: '1' });

      await controller.update('1', dto, req, file);
      expect(dto.imageURL).toEqual('http://image2.com');
    });
  });

  describe('remove', () => {
    it('should call actorService.remove', () => {
      mockActorService.remove.mockReturnValue({ id: '1' });
      const req = { user: { id: 'u1', role: 'ADMIN' } };
      const result = controller.remove('1', req);
      expect(result).toEqual({ id: '1' });
      expect(actorService.remove).toHaveBeenCalledWith('1', req.user);
    });
  });
});
