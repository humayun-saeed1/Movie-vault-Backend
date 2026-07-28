const fs = require('fs');
const write = (f, c) => fs.writeFileSync(f, c.trim() + '\n');

write('src/director/director.controller.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller.js';
import { DirectorService } from './director.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';
import { jest } from '@jest/globals';

describe('DirectorController', () => {
  let controller: DirectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorController],
      providers: [
        { provide: DirectorService, useValue: {} },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn() } },
      ],
    })
    .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DirectorController>(DirectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});`);

write('src/director/director.service.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { DirectorService } from './director.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('DirectorService', () => {
  let service: DirectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectorService,
        { provide: PrismaService, useValue: {} }
      ],
    }).compile();

    service = module.get<DirectorService>(DirectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`);

write('src/reviews/reviews.controller.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: {} }
      ],
    })
    .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});`);

write('src/reviews/reviews.service.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: {} }
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`);

write('src/auth/auth.controller.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { RoleGuard } from './role.guard.js';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} }
      ],
    })
    .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});`);

write('src/auth/auth.service.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: {} }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`);

write('src/actor/actor.service.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { ActorService } from './actor.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ActorService', () => {
  let service: ActorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorService,
        { provide: PrismaService, useValue: {} }
      ],
    }).compile();

    service = module.get<ActorService>(ActorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`);

write('src/movie/movie.service.spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { jest } from '@jest/globals';

describe('MovieService', () => {
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: PrismaService, useValue: {} },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn() } }
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`);
