import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller';

const router = Router();

router.post('/', authenticate, addToWatchlist);
router.get('/', authenticate, getWatchlist);
router.delete('/:movieId', authenticate, removeFromWatchlist);

export default router;
