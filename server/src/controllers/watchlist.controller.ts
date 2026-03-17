import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const watchlistSchema = z.object({
  movieId: z.number(),
});

export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const data = watchlistSchema.parse(req.body);

    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: data.movieId,
        },
      },
    });

    if (existingEntry) {
      res.status(400).json({ error: 'Movie is already in your watchlist' });
      return;
    }

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        movieId: data.movieId,
      },
    });

    res.status(201).json(watchlistItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ error: 'Failed to add to watchlist' });
    }
  }
};

export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};

export const removeFromWatchlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const movieId = Number(req.params.movieId);

    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!existingEntry) {
      res.status(404).json({ error: 'Movie not found in watchlist' });
      return;
    }

    await prisma.watchlist.delete({
      where: { id: existingEntry.id },
    });

    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
};
