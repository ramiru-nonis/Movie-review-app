import { Request, Response } from 'express';
import { tmdbClient } from '../services/tmdb.service';

export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
       res.status(400).json({ error: 'Query parameter is required' });
       return;
    }

    const response = await tmdbClient.get('/search/movie', {
      params: { query, page, include_adult: false },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('TMDB Search Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies from TMDB' });
  }
};

export const getTrendingMovies = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdbClient.get('/trending/movie/day', {
      params: { page },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('TMDB Trending Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: { append_to_response: 'credits,videos' },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('TMDB Details Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
};

export const discoverMovies = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      with_genres, 
      primary_release_year, 
      'vote_average.gte': vote_average_gte 
    } = req.query;

    const response = await tmdbClient.get('/discover/movie', {
      params: { 
        page, 
        with_genres, 
        primary_release_year, 
        'vote_average.gte': vote_average_gte,
        sort_by: 'popularity.desc',
        include_adult: false
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('TMDB Discover Error:', error.message);
    res.status(500).json({ error: 'Failed to discover movies' });
  }
};

export const getGenres = async (req: Request, res: Response) => {
  try {
    const response = await tmdbClient.get('/genre/movie/list');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('TMDB Genres Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};
