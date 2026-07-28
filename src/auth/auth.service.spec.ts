import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Role } from '#generated/prisma/index.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      role: 'VIEWER',
    };

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@test.com' });
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: '1', username: 'testuser' }); // username check
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      const createdUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedPassword',
        role: Role.VIEWER,
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);
      expect(result.message).toEqual('User registered successfully');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.username).toEqual('testuser');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should assign EDITOR role if specified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: '1', password: 'pw', role: Role.EDITOR });

      await service.register({ ...registerDto, role: 'EDITOR' });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ role: Role.EDITOR })
      }));
    });
  });

  describe('login', () => {
    const loginDto = { identity: 'test@test.com', password: 'password123' };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPw = await bcrypt.hash('differentPassword', 1);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: '1', password: hashedPw });
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user data on successful login', async () => {
      const hashedPw = await bcrypt.hash('password123', 1);
      const user = { id: '1', username: 'testuser', password: hashedPw, role: Role.VIEWER };
      mockPrismaService.user.findFirst.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');

      const result = await service.login(loginDto);
      expect(result.token).toEqual('fake-jwt-token');
      expect(result.user).toEqual({ id: '1', username: 'testuser', role: Role.VIEWER });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: '1', username: 'testuser', role: Role.VIEWER });
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ id: '1', username: 'test' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);
      const result = await service.getAllUsers();
      expect(result).toEqual(users);
    });
  });

  describe('getUserMe', () => {
    it('should return a single user', async () => {
      const user = { id: '1', username: 'test' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      const result = await service.getUserMe('1');
      expect(result).toEqual(user);
    });
  });
});
