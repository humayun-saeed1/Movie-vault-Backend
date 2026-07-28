import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { AuthGuard } from '../src/auth/auth.guard.js';
import { RoleGuard } from '../src/auth/role.guard.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
    .overrideGuard(RoleGuard).useValue({ canActivate: () => true })
    .compile();

    app = moduleFixture.createNestApplication();
    
    // We must pass a fake user for the req object since AuthGuard is mocked and doesn't attach one
    app.use((req, res, next) => {
      req.user = { id: 'test-user-id', role: 'ADMIN' };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movie/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/movie/get-all')
      .expect(200);
  });

  it('/actor/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/actor/get-all')
      .expect(200);
  });
});
