import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller.js';
import { MovieService } from './movie.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { jest } from '@jest/globals';
import { AuthGuard } from '../auth/auth.guard.js';
import { RoleGuard } from '../auth/role.guard.js';


describe('MovieController', () => {
    let controller: MovieController;

    const mockMovieService = {
        findAll: jest.fn(),
        create: jest.fn(),
        updateMovie: jest.fn(),
        deleteMovie: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MovieController],
            providers: [
                {
                    provide: MovieService,
                    useValue: mockMovieService,
                }, {
                    provide: CloudinaryService,
                    useValue: {
                        uploadImage: jest.fn(),
                    }
                }
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RoleGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<MovieController>(MovieController);
    });

    it('should get all movies', async () => {
        const movies = [
            { id: '1', name: 'Movie 1' },
            { id: '2', name: 'Movie 2' },
        ];
        mockMovieService.findAll.mockResolvedValue(movies);
        const fakeReq = { user: { id: '123', role: 'ADMIN' } };
        const fakeQuery = {};
        const result = await controller.findAll(fakeReq, fakeQuery);
        expect(result).toEqual(movies);
    });

    it('should get one movie by id', async () => {
        const movie = { id: '1', name: 'Movie 1' };
        mockMovieService.findOne.mockResolvedValue(movie);
        const result = await controller.findOne('1');
        expect(result).toEqual(movie);
    });

    it('should create a movie', async () => {
        const movie = { id: '1', name: 'Movie 1' };
        mockMovieService.create.mockResolvedValue(movie);
        const fakeBody = { name: 'Movie 1' };
        const fakeReq = { user: { id: '123', role: 'ADMIN' } };
        const result = await controller.create(fakeBody, fakeReq);
        expect(result).toEqual(movie);
    });
});
