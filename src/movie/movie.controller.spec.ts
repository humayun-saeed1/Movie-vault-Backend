import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller.js';
import { MovieService } from './movie.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service.js';

describe('MovieController', () => {
  let controller: MovieController;
  let movieService: MovieService;
  let cloudinaryService: CloudinaryService;

  const mockMovieService = {
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
      controllers: [MovieController],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateMovieDto = { name: 'Movie', releaseyear: 2024, duration: 120, genre: 'Action', description: 'desc', posterURl: '' };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should create a movie without file upload', async () => {
      mockMovieService.create.mockResolvedValue({ id: '1' });
      const result = await controller.create(dto, req, undefined);
      expect(result).toEqual({ id: '1' });
      expect(movieService.create).toHaveBeenCalledWith(dto, 'u1', 'ADMIN');
    });

    it('should upload file and create movie if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image.com' });
      mockMovieService.create.mockResolvedValue({ id: '1' });

      await controller.create(dto, req, file);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(dto.posterURl).toEqual('http://image.com');
    });

    it('should throw BadRequestException if upload fails', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockRejectedValue(new Error('fail'));
      await expect(controller.create(dto, req, file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should call movieService.findAll', () => {
      mockMovieService.findAll.mockReturnValue([]);
      const result = controller.findAll({ user: { id: 'u1', role: 'ADMIN' } }, {});
      expect(result).toEqual([]);
      expect(movieService.findAll).toHaveBeenCalledWith('u1', 'ADMIN', {});
    });
  });

  describe('findOne', () => {
    it('should call movieService.findOne', () => {
      mockMovieService.findOne.mockReturnValue({ id: '1' });
      const result = controller.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    const dto: UpdateMovieDto = { name: 'Movie 2' };
    const req = { user: { id: 'u1', role: 'ADMIN' } };

    it('should update a movie without file upload', async () => {
      mockMovieService.update.mockResolvedValue({ id: '1' });
      const result = await controller.update('1', dto, req, undefined);
      expect(result).toEqual({ id: '1' });
    });

    it('should upload file and update movie if file provided', async () => {
      const file = {} as Express.Multer.File;
      mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'http://image2.com' });
      mockMovieService.update.mockResolvedValue({ id: '1' });

      await controller.update('1', dto, req, file);
      expect(dto.posterURl).toEqual('http://image2.com');
    });
  });

  describe('remove', () => {
    it('should call movieService.remove', () => {
      mockMovieService.remove.mockReturnValue({ id: '1' });
      const req = { user: { id: 'u1', role: 'ADMIN' } };
      const result = controller.remove('1', req);
      expect(result).toEqual({ id: '1' });
      expect(movieService.remove).toHaveBeenCalledWith('1', req.user);
    });
  });
});
