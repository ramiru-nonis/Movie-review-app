import { Router } from 'express';
import { searchMovies, getTrendingMovies, getMovieDetails } from '../controllers/movie.controller';

const router = Router();

router.get('/search', searchMovies);
router.get('/trending', getTrendingMovies);
router.get('/:id', getMovieDetails);

export default router;
