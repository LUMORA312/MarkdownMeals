import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// All routes require admin auth
adminRouter.use(requireAdmin);

// ── Platform overview stats ──
adminRouter.get('/stats', async (_req, res) => {
  const [
    totalPartners,
    totalRestaurants,
    totalDeals,
    totalViews,
    totalRatings,
    totalReviews,
  ] = await Promise.all([
    prisma.partner.count(),
    prisma.restaurant.count(),
    prisma.dish.count(),
    prisma.tokenDish.count(),
    prisma.rating.count(),
    prisma.review.count(),
  ]);

  const activeDeals = await prisma.dish.count({
    where: { dealExpiresAt: { gt: new Date() } },
  });

  res.json({
    totalPartners,
    totalRestaurants,
    totalDeals,
    activeDeals,
    totalViews,
    totalRatings,
    totalReviews,
  });
});

// ── Analytics: most viewed deals ──
adminRouter.get('/analytics/most-viewed', async (_req, res) => {
  const dishes = await prisma.dish.findMany({
    include: {
      tokenDishes: true,
      restaurant: { select: { name: true } },
    },
    orderBy: { tokenDishes: { _count: 'desc' } },
    take: 10,
  });
  res.json(
    dishes.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.image,
      price: d.price,
      restaurantName: d.restaurant.name,
      views: d.tokenDishes.length,
    }))
  );
});

// ── Analytics: most active partners ──
adminRouter.get('/analytics/most-active-partners', async (_req, res) => {
  const partners = await prisma.partner.findMany({
    include: {
      restaurants: {
        include: { dishes: true },
      },
    },
  });
  const result = partners
    .map((p) => ({
      id: p.id,
      businessName: p.businessName,
      email: p.email,
      totalRestaurants: p.restaurants.length,
      totalDeals: p.restaurants.reduce((sum, r) => sum + r.dishes.length, 0),
    }))
    .sort((a, b) => b.totalDeals - a.totalDeals)
    .slice(0, 10);
  res.json(result);
});

// ── Analytics: newest deals ──
adminRouter.get('/analytics/newest-deals', async (_req, res) => {
  const deals = await prisma.dish.findMany({
    include: { restaurant: { select: { name: true } } },
    orderBy: { dealExpiresAt: 'desc' },
    take: 10,
  });
  res.json(
    deals.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.image,
      price: d.price,
      category: d.category,
      restaurantName: d.restaurant.name,
      dealExpiresAt: d.dealExpiresAt,
    }))
  );
});

// ── Analytics: deals by category ──
adminRouter.get('/analytics/by-category', async (_req, res) => {
  const dishes = await prisma.dish.findMany({ select: { category: true } });
  const counts: Record<string, number> = {};
  for (const d of dishes) {
    counts[d.category] = (counts[d.category] || 0) + 1;
  }
  res.json(
    Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  );
});

// ── Analytics: trend (deals + views per day, last 30 days) ──
adminRouter.get('/analytics/trend', async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const tokens = await prisma.redirectToken.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  const reviews = await prisma.review.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  const dayMap: Record<string, { views: number; reviews: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { views: 0, reviews: 0 };
  }
  for (const t of tokens) {
    const key = t.createdAt.toISOString().slice(0, 10);
    if (dayMap[key]) dayMap[key].views++;
  }
  for (const r of reviews) {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (dayMap[key]) dayMap[key].reviews++;
  }

  res.json(
    Object.entries(dayMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  );
});

// ── List all partners ──
adminRouter.get('/partners', async (_req, res) => {
  const partners = await prisma.partner.findMany({
    include: {
      restaurants: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(
    partners.map((p) => ({
      id: p.id,
      email: p.email,
      businessName: p.businessName,
      phone: p.phone,
      createdAt: p.createdAt,
      restaurants: p.restaurants,
    }))
  );
});

// ── List all deals (paginated) ──
adminRouter.get('/deals', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const [deals, total] = await Promise.all([
    prisma.dish.findMany({
      include: {
        restaurant: { select: { name: true } },
        modifiers: true,
        tokenDishes: true,
        reviews: true,
      },
      orderBy: { dealExpiresAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.dish.count(),
  ]);

  res.json({
    deals: deals.map((d) => ({
      ...d,
      views: d.tokenDishes.length,
      reviewCount: d.reviews.length,
      restaurantName: d.restaurant.name,
      tokenDishes: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// ── Edit any deal ──
adminRouter.put('/deals/:dealId', async (req, res) => {
  const dish = await prisma.dish.findUnique({ where: { id: req.params.dealId } });
  if (!dish) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  const { modifiers, dealExpiresAt, ...rest } = req.body;
  const updated = await prisma.dish.update({
    where: { id: req.params.dealId },
    data: {
      ...rest,
      dealExpiresAt: dealExpiresAt ? new Date(dealExpiresAt) : undefined,
    },
    include: { modifiers: true },
  });
  if (modifiers) {
    await prisma.dishModifier.deleteMany({ where: { dishId: dish.id } });
    await prisma.dishModifier.createMany({
      data: modifiers.map((m: string) => ({ name: m, dishId: dish.id })),
    });
  }
  const result = await prisma.dish.findUnique({
    where: { id: req.params.dealId },
    include: { modifiers: true, restaurant: { select: { name: true } } },
  });
  res.json(result);
});

// ── Delete any deal ──
adminRouter.delete('/deals/:dealId', async (req, res) => {
  const dish = await prisma.dish.findUnique({ where: { id: req.params.dealId } });
  if (!dish) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  await prisma.dish.delete({ where: { id: req.params.dealId } });
  res.json({ success: true });
});

// ── List all reviews (with moderation) ──
adminRouter.get('/reviews', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        dish: { select: { name: true, image: true } },
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count(),
  ]);

  res.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
});

// ── Delete a review (moderation) ──
adminRouter.delete('/reviews/:reviewId', async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  await prisma.review.delete({ where: { id: req.params.reviewId } });
  res.json({ success: true });
});
