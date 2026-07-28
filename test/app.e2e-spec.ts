import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { AuthGuard } from '../src/auth/auth.guard.js';
import { RoleGuard } from '../src/auth/role.guard.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let actorId: string;
  let movieId: string;
  let directorId: string;
  let reviewId: string;

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

    // Create the test user in the database so that nested writes for 'creator' succeed
    const prisma = app.get(PrismaService);
    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: {},
      create: {
        id: 'test-user-id',
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // Testing the endpoints by send qurey in url and no url both for movies
  it('should return 200 when sending qurey in url', () => {
    return request(app.getHttpServer())
      .get('/movie/get-all')
      .query({ genre: 'Sci-Fi' })
      .expect(200);
  });
  it('should return 200 when sending qurey in url', () => {
    return request(app.getHttpServer())
      .get('/movie/get-all')
      .expect(200);
  });
  // Testing the endpoints by send qurey in url and no url both for directors
  it('/director/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/director/get-all')
      .query({ name: 'Christopher Nolan' })
      .expect(200);
  });
  it('/director/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/director/get-all')
      .expect(200);
  });

  // Testing the endpoints by send qurey in url and no url both for actors
  it('/actor/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/actor/get-all')
      .query({ name: 'Tom Hardy' })
      .expect(200);
  });
  it('/actor/get-all (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/actor/get-all')
      .expect(200);
  });

  it("/director/get-all (GET) should return 200", () => {
    return request(app.getHttpServer())
      .get('/director/get-all')
      .expect(200);
  });

  it("/actor/create (POST) should return 201", () => {
    return request(app.getHttpServer())
      .post('/actor/create')
      .send({
        name: "Tom Hardy",
        age: 48,
        about: "Tom Hardy is a famous actor",
        imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        actorId = res.body.id;
        expect(res.body).toHaveProperty('name', 'Tom Hardy');
        expect(res.body).toHaveProperty('age', 48);
        expect(res.body).toHaveProperty('about', 'Tom Hardy is a famous actor');
        expect(res.body).toHaveProperty('imageURL', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s');
      });
  });

  it("/director/create (POST) should return 201", () => {
    return request(app.getHttpServer())
      .post('/director/create')
      .send({
        name: "Christopher Nolan",
        age: 53,
        about: "Famous director",
        imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:...",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        directorId = res.body.id; // Populate the directorId!
      });
  });

  it("/actor/update/:id (PATCH) should return 200", () => {
    return request(app.getHttpServer())
      .patch(`/actor/edit/${actorId}`)
      .send({
        name: "Tom Hardy Updated",
        age: 49,
        about: "Tom Hardy is a famous actor updated",
        imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s",
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'Tom Hardy Updated');
        expect(res.body).toHaveProperty('age', 49);
        expect(res.body).toHaveProperty('about', 'Tom Hardy is a famous actor updated');
        expect(res.body).toHaveProperty('imageURL', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s');
      });
  });


  it("/movie/create (POST) should return 201", () => {
    return request(app.getHttpServer())
      .post('/movie/create')
      .send({
        name: "The Matrix",
        posterURl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s",
        releaseyear: 2022,
        genre: "Sci-Fi",
        duration: 120,
        trailerURL: "https://www.youtube.com/watch?v=123"
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        movieId = res.body.id;
        expect(res.body).toHaveProperty('name', 'The Matrix');
        expect(res.body).toHaveProperty('posterURl', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-M2C-9-f5Q2k6j2_R9W9G6g2_R9W9G6g2_R9W9G6g2&s');
        expect(res.body).toHaveProperty('releaseyear', 2022);
        expect(res.body).toHaveProperty('genre', 'Sci-Fi');
        expect(res.body).toHaveProperty('duration', 120);
        expect(res.body).toHaveProperty('trailerURL', 'https://www.youtube.com/watch?v=123');
      });
  });

  it ("/movie/add-director/:id (PATCH) should return 200", () => {
    return request(app.getHttpServer())
      .patch(`/movie/edit/${movieId}`) // Using edit endpoint!
      .send({
        directorID: [directorId],
      })
      .expect(200);
  });

  it("/movie/add-actor/:id (PATCH) should return 200", () => {
    return request(app.getHttpServer())
      .patch(`/movie/edit/${movieId}`) // Using edit endpoint!
      .send({
        actorID: [actorId],
      })
      .expect(200);
  });

  it("/movie/update/:id (PATCH) should return 200", () => {
    return request(app.getHttpServer())
      .patch(`/movie/edit/${movieId}`)
      .send({
        name: "The Matrix Updated",
        duration: 140,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'The Matrix Updated');
        expect(res.body).toHaveProperty('duration', 140);
      });
  });

  // ===================== REVIEW ENDPOINTS =====================

  it("/reviews (POST) should create a review and return 201", () => {
    return request(app.getHttpServer())
      .post('/reviews')
      .send({
        rating: 8,
        comment: "Great movie!",
        movieId: movieId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        reviewId = res.body.id;
        expect(res.body).toHaveProperty('rating', 8);
        expect(res.body).toHaveProperty('comment', 'Great movie!');
        expect(res.body).toHaveProperty('movieId', movieId);
      });
  });

  it("/reviews/movie/:movieId (GET) should return 200", () => {
    return request(app.getHttpServer())
      .get(`/reviews/movie/${movieId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id', reviewId);
      });
  });

  // ===================== WATCHLIST ENDPOINTS =====================

  it("/watchlist/toggle/:movieId (POST) should return 201/200", () => {
    return request(app.getHttpServer())
      .post(`/watchlist/toggle/${movieId}`)
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
  });

  it("/watchlist/my (GET) should return 200", () => {
    return request(app.getHttpServer())
      .get('/watchlist/my')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((item) => item.id === movieId)).toBe(true);
      });
  });

  // ===================== FAVOURITE ENDPOINTS =====================

  it("/favourite/toggle/:movieId (POST) should return 201/200", () => {
    return request(app.getHttpServer())
      .post(`/favourite/toggle/${movieId}`)
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
  });

  it("/favourite/my (GET) should return 200", () => {
    return request(app.getHttpServer())
      .get('/favourite/my')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((item) => item.id === movieId)).toBe(true);
      });
  });

  // ===================== DELETE ENDPOINTS =====================

  it("/reviews/:id (DELETE) should return 200", () => {
    return request(app.getHttpServer())
      .delete(`/reviews/${reviewId}`)
      .expect(200);
  });

  it("/movie/delete/:id (DELETE) should return 200", () => {
    return request(app.getHttpServer())
      .delete(`/movie/delete/${movieId}`)
      .expect(200)
      .expect((res) => {
        // The API returns the deleted object, NOT a message
        expect(res.body).toHaveProperty('id', movieId);
      });
  });

  it("/actor/delete/:id (DELETE) should return 200", () => {
    return request(app.getHttpServer())
      .delete(`/actor/delete/${actorId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', actorId);
      });
  });

  it("/director/delete/:id (DELETE) should return 200", () => {
    return request(app.getHttpServer())
      .delete(`/director/delete/${directorId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', directorId);
      });
  });
});
