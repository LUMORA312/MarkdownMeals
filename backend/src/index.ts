import express from 'express';
import cors from 'cors';
import path from 'path';
import { restaurantsRouter } from './routes/restaurants.js';
import { tokensRouter } from './routes/tokens.js';
import { ratingsRouter } from './routes/ratings.js';
import { favoritesRouter } from './routes/favorites.js';
import { reviewsRouter } from './routes/reviews.js';
import { authRouter } from './routes/auth.js';
import { partnerRouter } from './routes/partner.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:8080',
  'https://markdown-meals.vercel.app',
  'https://markdownmeals.onrender.com'
];

const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔎 Incoming origin:', origin);

    // Allow non-browser requests (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      console.log('✅ CORS allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      // Throw an error so browser sees proper CORS failure
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Session middleware — uses a simple header-based session ID
app.use((req, _res, next) => {
  req.sessionId = req.headers['x-session-id'] as string || 'anonymous';
  next();
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler — logs the real error and returns 500 with message
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`FoodMan server running on ${PORT}`);
});
