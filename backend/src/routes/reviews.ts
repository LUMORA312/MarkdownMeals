import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const reviewsRouter = Router();

const VALID_BADGES = [
  'Flavor Bomb',
  'Crave Worthy',
  'Instant Favorite',
  'Low-Key Fire',
  "Can't Miss",
  'Next Move',
] as const;

const submitReviewSchema = z.object({
  email: z.string().email(),
  badge: z.enum(VALID_BADGES),
  comment: z.string().max(200).optional(),
  dishId: z.string(),
  restaurantId: z.string(),
});

// POST /api/reviews
reviewsRouter.post('/', async (req, res) => {
  const parsed = submitReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, badge, comment, dishId, restaurantId } = parsed.data;

  // Verify dish and restaurant exist
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish) {
    res.status(404).json({ error: 'Dish not found' });
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  // Upsert — one review per email per dish
  const review = await prisma.review.upsert({
    where: { email_dishId: { email, dishId } },
    update: { badge, comment },
    create: { email, badge, comment, dishId, restaurantId },
  });

  res.status(201).json({
    id: review.id,
    email: review.email,
    badge: review.badge,
    comment: review.comment,
    dishId: review.dishId,
    restaurantId: review.restaurantId,
    createdAt: review.createdAt.getTime(),
  });
});

// GET /api/reviews/dish/:dishId
reviewsRouter.get('/dish/:dishId', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { dishId: req.params.dishId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    reviews.map((r) => ({
      id: r.id,
      badge: r.badge,
      comment: r.comment,
      createdAt: r.createdAt.getTime(),
    }))
  );
});

// GET /api/reviews/dish/:dishId/summary — badge counts
reviewsRouter.get('/dish/:dishId/summary', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { dishId: req.params.dishId },
  });

  const counts: Record<string, number> = {};
  for (const r of reviews) {
    counts[r.badge] = (counts[r.badge] || 0) + 1;
  }

  res.json({ total: reviews.length, badges: counts });
});
