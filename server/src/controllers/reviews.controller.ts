import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(3),
  movieId: z.number(),
});

export const addReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const data = reviewSchema.parse(req.body);

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: data.movieId,
        },
      },
    });

    if (existingReview) {
      res.status(400).json({ error: 'You have already reviewed this movie.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        reviewText: data.reviewText,
        movieId: data.movieId,
        userId,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    res.status(201).json(review);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(500).json({ error: 'Failed to add review' });
    }
  }
};

export const getMovieReviews = async (req: Request, res: Response) => {
  try {
    const movieId = Number(req.params.movieId);

    const reviews = await prisma.review.findMany({
      where: { movieId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId } = req.user!;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.review.delete({ where: { id } });

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId } = req.user!;
    const { rating, reviewText } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating ? { rating: Number(rating) } : {}),
        ...(reviewText ? { reviewText } : {}),
      },
      include: {
        user: { select: { username: true } },
      },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};
