import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getAllUsers: jest.fn(),
    getUserMe: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (signup)', () => {
    it('should call authService.register and return the result', async () => {
      const dto: RegisterDto = { username: 'test', email: 't@t.com', password: 'pw', role: 'VIEWER' };
      const expectedResult = { message: 'Success', user: { id: '1', username: 'test' } };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should bubble up exceptions from authService.register', async () => {
      const dto: RegisterDto = { username: 'test', email: 't@t.com', password: 'pw', role: 'VIEWER' };
      const error = new Error('Conflict');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toThrow('Conflict');
    });
  });

  describe('login (signin)', () => {
    it('should call authService.login and return the result', async () => {
      const dto: LoginDto = { identity: 't@t.com', password: 'pw' };
      const expectedResult = { token: 'jwt', message: 'Success', user: { id: '1', username: 'test' } };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should bubble up exceptions from authService.login', async () => {
      const dto: LoginDto = { identity: 't@t.com', password: 'pw' };
      const error = new Error('Unauthorized');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(dto)).rejects.toThrow('Unauthorized');
    });
  });

  describe('getAllUsers', () => {
    it('should call authService.getAllUsers', async () => {
      mockAuthService.getAllUsers.mockResolvedValue([{ id: '1' }]);
      const result = await controller.getAllUsers();
      expect(authService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('createEditor', () => {
    it('should force role to EDITOR and call register', async () => {
      const dto: RegisterDto = { username: 'editor', email: 'e@e.com', password: 'pw', role: 'VIEWER' };
      mockAuthService.register.mockResolvedValue({ message: 'Success' });
      await controller.createEditor(dto);
      expect(authService.register).toHaveBeenCalledWith({ ...dto, role: 'EDITOR' }); 
    });

    it('should use default EDITOR if no role is provided', async () => {
      const dto: any = { username: 'editor', email: 'e@e.com', password: 'pw' };
      mockAuthService.register.mockResolvedValue({ message: 'Success' });
      await controller.createEditor(dto);
      expect(authService.register).toHaveBeenCalledWith({ ...dto, role: 'EDITOR' }); 
    });
  });

  describe('getUserMe', () => {
    it('should call authService.getUserMe with id', async () => {
      mockAuthService.getUserMe.mockResolvedValue({ id: '1' });
      const result = await controller.getUserMe('1');
      expect(authService.getUserMe).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1' });
    });
  });
});
