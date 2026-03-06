import { Router } from 'express';
import { prisma } from '../db.js';

export const favoritesRouter = Router();

// GET /api/favorites — get all favorites for the session
favoritesRouter.get('/', async (req, res) => {
  const sessionId = req.sessionId;

  const favorites = await prisma.favorite.findMany({
    where: { sessionId },
    select: { restaurantId: true },
  });

  res.json(favorites.map((f) => f.restaurantId));
});

// POST /api/favorites/:restaurantId — toggle favorite
favoritesRouter.post('/:restaurantId', async (req, res) => {
  const sessionId = req.sessionId;
  const { restaurantId } = req.params;

  // Verify restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      sessionId_restaurantId: { sessionId, restaurantId },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    res.json({ favorited: false, restaurantId });
  } else {
    await prisma.favorite.create({
      data: { sessionId, restaurantId },
    });
    res.json({ favorited: true, restaurantId });
  }
});
