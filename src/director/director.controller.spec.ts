import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller.js';
import { DirectorService } from './director.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateDirectorDto } from './dto/create-director.dto.js';
import { UpdateDirectorDto } from './dto/update-director.dto.js';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('DirectorController', () => {
  let controller: DirectorController;
  let directorService: DirectorService;
  let cloudinaryService: CloudinaryService;

  const mockDirectorService = {
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
      controllers: [DirectorController],
      providers: [
        { provide: DirectorService, useValue: mockDirectorService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<DirectorController>(DirectorController);
    directorService = module.get<DirectorService>(DirectorService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateDirectorDto = { name: 'Director', age: 40, about: 'Bio', imageURL: '', movieID: [] };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should create a director without file upload', async () => {
      mockDirectorService.create.mockResolvedValue({ id: '1' });
      const result = await controller.create(dto, req, undefined);
      expect(result).toEqual({ id: '1' });
      expect(directorService.create).toHaveBeenCalledWith(dto, 'u1', 'ADMIN');
    });

    it('should upload file and create director if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image.com' });
      mockDirectorService.create.mockResolvedValue({ id: '1' });

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
    it('should call directorService.findAll', () => {
      mockDirectorService.findAll.mockReturnValue([]);
      const result = controller.findAll({ user: { id: 'u1', role: 'ADMIN' } }, {});
      expect(result).toEqual([]);
      expect(directorService.findAll).toHaveBeenCalledWith('u1', 'ADMIN', {});
    });
  });

  describe('findOne', () => {
    it('should call directorService.findOne', () => {
      mockDirectorService.findOne.mockReturnValue({ id: '1' });
      const result = controller.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    const dto: UpdateDirectorDto = { name: 'Director 2' };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should update a director without file upload', async () => {
      mockDirectorService.update.mockResolvedValue({ id: '1' });
      const result = await controller.update('1', dto, req, undefined);
      expect(result).toEqual({ id: '1' });
    });

    it('should upload file and update director if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image2.com' });
      mockDirectorService.update.mockResolvedValue({ id: '1' });

      await controller.update('1', dto, req, file);
      expect(dto.imageURL).toEqual('http://image2.com');
    });
  });

  describe('remove', () => {
    it('should call directorService.remove', () => {
      mockDirectorService.remove.mockReturnValue({ id: '1' });
      const req = { user: { id: 'u1', role: 'ADMIN' } };
      const result = controller.remove('1', req);
      expect(result).toEqual({ id: '1' });
      expect(directorService.remove).toHaveBeenCalledWith('1', req.user);
    });
  });
});
