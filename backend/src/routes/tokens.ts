import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const tokensRouter = Router();

const createTokenSchema = z.object({
  restaurantId: z.string(),
  dishIds: z.array(z.string()).min(1).max(5),
});

// POST /api/tokens — create a redirect token (claim a deal)
tokensRouter.post('/', async (req, res) => {
  const parsed = createTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { restaurantId, dishIds } = parsed.data;

  // Verify restaurant and dishes exist
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { dishes: true },
  });

  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  const validDishIds = restaurant.dishes.map((d) => d.id);
  const invalidIds = dishIds.filter((id) => !validDishIds.includes(id));
  if (invalidIds.length > 0) {
    res.status(400).json({ error: `Invalid dish IDs: ${invalidIds.join(', ')}` });
    return;
  }

  const token = await prisma.redirectToken.create({
    data: {
      restaurantId,
      ratingAvailableAt: new Date(Date.now() + 60 * 60 * 1000), // 60 min
      dishes: {
        create: dishIds.map((dishId) => ({ dishId })),
      },
    },
    include: {
      dishes: { include: { dish: true } },
    },
  });

  res.status(201).json({
    id: token.id,
    restaurantId: token.restaurantId,
    dishIds: token.dishes.map((td) => td.dishId),
    createdAt: token.createdAt.getTime(),
    ratingAvailableAt: token.ratingAvailableAt.getTime(),
  });
});

// GET /api/tokens/:id
tokensRouter.get('/:id', async (req, res) => {
  const token = await prisma.redirectToken.findUnique({
    where: { id: req.params.id },
    include: {
      dishes: { include: { dish: { include: { modifiers: true } } } },
      restaurant: { include: { categories: true } },
      rating: true,
    },
  });

  if (!token) {
    res.status(404).json({ error: 'Token not found' });
    return;
  }

  res.json({
    id: token.id,
    restaurantId: token.restaurantId,
    restaurant: {
      id: token.restaurant.id,
      name: token.restaurant.name,
      categories: token.restaurant.categories.map((c) => c.name),
    },
    dishIds: token.dishes.map((td) => td.dishId),
    dishes: token.dishes.map((td) => ({
      id: td.dish.id,
      name: td.dish.name,
      image: td.dish.image,
      category: td.dish.category,
      primaryTaste: td.dish.primaryTaste,
      modifiers: td.dish.modifiers.map((m) => m.name),
      price: td.dish.price,
    })),
    createdAt: token.createdAt.getTime(),
    ratingAvailableAt: token.ratingAvailableAt.getTime(),
    hasRating: !!token.rating,
  });
});
