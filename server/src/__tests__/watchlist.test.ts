import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

// Mock Prisma
vi.mock('../lib/prisma', () => ({
  prisma: {
    watchlist: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

describe('Watchlist API', () => {
  const mockUser = { id: 'user-123', userId: 'user-123', username: 'testuser' };
  const mockToken = 'mock-token';

  beforeEach(() => {
    vi.clearAllMocks();
    (jwt.verify as any).mockReturnValue(mockUser);
  });

  describe('GET /api/watchlist', () => {
    it('should return watchlist for authenticated user', async () => {
      const mockWatchlist = [
        { id: '1', userId: 'user-123', movieId: 550, createdAt: new Date() },
      ];
      (prisma.watchlist.findMany as any).mockResolvedValue(mockWatchlist);

      const response = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].movieId).toBe(550);
    });

    it('should return 401 if not authenticated', async () => {
      (jwt.verify as any).mockImplementation(() => { throw new Error('Invalid token'); });

      const response = await request(app).get('/api/watchlist');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/watchlist', () => {
    it('should add a movie to watchlist', async () => {
      (prisma.watchlist.findUnique as any).mockResolvedValue(null);
      (prisma.watchlist.create as any).mockResolvedValue({
        userId: 'user-123',
        movieId: 600,
      });

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ movieId: 600 });

      expect(response.status).toBe(201);
      expect(response.body.movieId).toBe(600);
      expect(prisma.watchlist.create).toHaveBeenCalled();
    });

    it('should return 400 if movie is already in watchlist', async () => {
      (prisma.watchlist.findUnique as any).mockResolvedValue({ id: 'exists' });

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ movieId: 600 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Movie is already in your watchlist');
    });
  });

  describe('DELETE /api/watchlist/:movieId', () => {
    it('should remove a movie from watchlist', async () => {
      (prisma.watchlist.findUnique as any).mockResolvedValue({ id: 'entry-id' });

      const response = await request(app)
        .delete('/api/watchlist/600')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Removed from watchlist');
      expect(prisma.watchlist.delete).toHaveBeenCalledWith({
        where: { id: 'entry-id' },
      });
    });

    it('should return 404 if movie not in watchlist', async () => {
      (prisma.watchlist.findUnique as any).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/watchlist/600')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });
});
