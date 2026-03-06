import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const ratingsRouter = Router();

const VALID_EMOJIS = ['😍', '😋', '😊', '😐', '😕'] as const;
const VALID_TAGS = [
  'Worth the trip',
  'Great value',
  'Perfectly cooked',
  'Fresh ingredients',
  'Beautiful plating',
  'Generous portions',
  'Quick service',
  'Cozy vibes',
  'Would order again',
  'Overrated',
] as const;

const submitRatingSchema = z.object({
  tokenId: z.string(),
  emoji: z.enum(VALID_EMOJIS),
  tags: z.array(z.enum(VALID_TAGS)).default([]),
});

// POST /api/ratings
ratingsRouter.post('/', async (req, res) => {
  const parsed = submitRatingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tokenId, emoji, tags } = parsed.data;

  const token = await prisma.redirectToken.findUnique({
    where: { id: tokenId },
    include: { rating: true },
  });

  if (!token) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  if (token.rating) {
    res.status(409).json({ error: 'Rating already submitted for this token' });
    return;
  }

  // Time gate check (skip for demo if within reasonable bounds)
  const now = new Date();
  if (now < token.ratingAvailableAt) {
    const msLeft = token.ratingAvailableAt.getTime() - now.getTime();
    res.status(425).json({
      error: 'Rating not yet available',
      ratingAvailableAt: token.ratingAvailableAt.getTime(),
      msLeft,
    });
    return;
  }

  const rating = await prisma.rating.create({
    data: {
      emoji,
      tokenId,
      restaurantId: token.restaurantId,
      tags: {
        create: tags.map((name) => ({ name })),
      },
    },
    include: { tags: true },
  });

  // Update restaurant average rating
  const allRatings = await prisma.rating.findMany({
    where: { restaurantId: token.restaurantId },
  });
  const emojiScores: Record<string, number> = {
    '😍': 5, '😋': 4, '😊': 3, '😐': 2, '😕': 1,
  };
  const avg =
    allRatings.reduce((sum, r) => sum + (emojiScores[r.emoji] || 3), 0) /
    allRatings.length;
  await prisma.restaurant.update({
    where: { id: token.restaurantId },
    data: { rating: Math.round(avg * 10) / 10 },
  });

  res.status(201).json({
    id: rating.id,
    emoji: rating.emoji,
    tags: rating.tags.map((t) => t.name),
    restaurantId: rating.restaurantId,
  });
});

// GET /api/ratings/restaurant/:restaurantId
ratingsRouter.get('/restaurant/:restaurantId', async (req, res) => {
  const ratings = await prisma.rating.findMany({
    where: { restaurantId: req.params.restaurantId },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    ratings.map((r) => ({
      id: r.id,
      emoji: r.emoji,
      tags: r.tags.map((t) => t.name),
      createdAt: r.createdAt.getTime(),
    }))
  );
});
