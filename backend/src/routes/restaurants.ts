import { Router } from 'express';
import { prisma } from '../db.js';

export const restaurantsRouter = Router();

// GET /api/restaurants?tastes=Savory,Sweet&deals=BOGO,Under $10&search=flame
restaurantsRouter.get('/', async (req, res) => {
  const tastes = req.query.tastes ? (req.query.tastes as string).split(',') : [];
  const deals = req.query.deals ? (req.query.deals as string).split(',') : [];
  const search = (req.query.search as string || '').trim();

  const restaurants = await prisma.restaurant.findMany({
    include: {
      categories: true,
      dishes: {
        include: { modifiers: true },
      },
    },
  });

  const now = new Date();

  const filtered = restaurants.filter((r) => {
    const matchesTaste =
      tastes.length === 0 ||
      r.dishes.some((d) => tastes.includes(d.primaryTaste));

    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase());

    const matchesDeal =
      deals.length === 0 ||
      r.dishes.some(
        (d) =>
          d.dealType &&
          deals.includes(d.dealType) &&
          (!d.dealExpiresAt || d.dealExpiresAt > now)
      );

    return matchesTaste && matchesSearch && matchesDeal;
  });

  const result = filtered.map((r) => ({
    id: r.id,
    name: r.name,
    coverImage: r.coverImage,
    redirectUrl: r.redirectUrl,
    rating: r.rating,
    categories: r.categories.map((c) => c.name),
    dishes: r.dishes.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.image,
      category: d.category,
      primaryTaste: d.primaryTaste,
      modifiers: d.modifiers.map((m) => m.name),
      price: d.price,
      originalPrice: d.originalPrice,
      dealType: d.dealType,
      dealExpiresAt: d.dealExpiresAt ? d.dealExpiresAt.getTime() : undefined,
    })),
  }));

  res.json(result);
});

// GET /api/restaurants/:id
restaurantsRouter.get('/:id', async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: {
      categories: true,
      dishes: {
        include: { modifiers: true },
      },
    },
  });

  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  res.json({
    id: restaurant.id,
    name: restaurant.name,
    coverImage: restaurant.coverImage,
    redirectUrl: restaurant.redirectUrl,
    rating: restaurant.rating,
    categories: restaurant.categories.map((c) => c.name),
    dishes: restaurant.dishes.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.image,
      category: d.category,
      primaryTaste: d.primaryTaste,
      modifiers: d.modifiers.map((m) => m.name),
      price: d.price,
      originalPrice: d.originalPrice,
      dealType: d.dealType,
      dealExpiresAt: d.dealExpiresAt ? d.dealExpiresAt.getTime() : undefined,
    })),
  });
});
