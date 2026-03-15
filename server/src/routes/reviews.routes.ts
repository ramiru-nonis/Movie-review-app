import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { addReview, getMovieReviews, deleteReview, updateReview } from '../controllers/reviews.controller';

const router = Router();

router.post('/', authenticate, addReview);
router.get('/movie/:movieId', getMovieReviews);
router.delete('/:id', authenticate, deleteReview);
router.put('/:id', authenticate, updateReview);

export default router;
