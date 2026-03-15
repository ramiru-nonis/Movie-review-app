import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import reviewsRoutes from './routes/reviews.routes';
import watchlistRoutes from './routes/watchlist.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
