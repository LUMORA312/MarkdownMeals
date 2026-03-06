import express from 'express';
import cors from 'cors';
import { restaurantsRouter } from './routes/restaurants.js';
import { tokensRouter } from './routes/tokens.js';
import { ratingsRouter } from './routes/ratings.js';
import { favoritesRouter } from './routes/favorites.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3001',
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

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/favorites', favoritesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`FoodMan server running on ${PORT}`);
});
