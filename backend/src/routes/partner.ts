import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requirePartner } from '../middleware/auth.js';

export const partnerRouter = Router();

// All routes require partner auth
partnerRouter.use(requirePartner);

// ── Dashboard overview ──
partnerRouter.get('/dashboard', async (req, res) => {
  const partnerId = req.partnerId!;
  const restaurants = await prisma.restaurant.findMany({
    where: { partnerId },
    include: {
      dishes: { include: { reviews: true, tokenDishes: true } },
      ratings: true,
      reviews: true,
    },
  });

  const totalDeals = restaurants.reduce((sum, r) => sum + r.dishes.length, 0);
  const activeDeals = restaurants.reduce(
    (sum, r) => sum + r.dishes.filter((d) => d.dealExpiresAt > new Date()).length,
    0
  );
  const totalViews = restaurants.reduce(
    (sum, r) => sum + r.dishes.reduce((s, d) => s + d.tokenDishes.length, 0),
    0
  );
  const totalRatings = restaurants.reduce((sum, r) => sum + r.ratings.length, 0);
  const totalReviews = restaurants.reduce((sum, r) => sum + r.reviews.length, 0);

  res.json({
    restaurants: restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      coverImage: r.coverImage,
    })),
    stats: { totalDeals, activeDeals, totalViews, totalRatings, totalReviews },
  });
});

// ── List partner's restaurants ──
partnerRouter.get('/restaurants', async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { partnerId: req.partnerId! },
    include: { categories: true, dishes: { include: { modifiers: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(restaurants);
});

// ── Create restaurant ──
const createRestaurantSchema = z.object({
  name: z.string().min(1),
  coverImage: z.string().min(1),
  redirectUrl: z.string().url(),
  categories: z.array(z.string()).optional(),
});

partnerRouter.post('/restaurants', async (req, res) => {
  const parsed = createRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, coverImage, redirectUrl, categories } = parsed.data;
  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      coverImage,
      redirectUrl,
      partnerId: req.partnerId!,
      categories: categories
        ? { create: categories.map((c) => ({ name: c })) }
        : undefined,
    },
    include: { categories: true },
  });
  res.status(201).json(restaurant);
});

// ── List deals for a restaurant ──
partnerRouter.get('/restaurants/:restaurantId/deals', async (req, res) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: req.params.restaurantId, partnerId: req.partnerId! },
  });
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  const dishes = await prisma.dish.findMany({
    where: { restaurantId: req.params.restaurantId },
    include: { modifiers: true, tokenDishes: true, reviews: true },
    orderBy: { dealExpiresAt: 'desc' },
  });
  res.json(
    dishes.map((d) => ({
      ...d,
      views: d.tokenDishes.length,
      reviewCount: d.reviews.length,
      tokenDishes: undefined,
    }))
  );
});

// ── Create deal (dish) ──
const createDealSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  category: z.string().min(1),
  primaryTaste: z.string().min(1),
  price: z.number().positive(),
  feeds: z.string().min(1),
  dealType: z.string().optional(),
  dealExpiresAt: z.string().or(z.number()),
  destinationUrl: z.string().optional(),
  modifiers: z.array(z.string()).optional(),
  spiceLevel: z.string().optional(),
  popularity: z.string().optional(),
});

partnerRouter.post('/restaurants/:restaurantId/deals', async (req, res) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: req.params.restaurantId, partnerId: req.partnerId! },
  });
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  const parsed = createDealSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, image, category, primaryTaste, price, feeds, dealType, dealExpiresAt, destinationUrl, modifiers } = parsed.data;
  const dish = await prisma.dish.create({
    data: {
      name,
      image,
      category,
      primaryTaste,
      price,
      feeds,
      dealType: dealType || null,
      dealExpiresAt: new Date(dealExpiresAt),
      destinationUrl: destinationUrl || null,
      restaurantId: req.params.restaurantId,
      modifiers: modifiers
        ? { create: modifiers.map((m) => ({ name: m })) }
        : undefined,
    },
    include: { modifiers: true },
  });
  res.status(201).json(dish);
});

// ── Update deal ──
partnerRouter.put('/deals/:dealId', async (req, res) => {
  const dish = await prisma.dish.findUnique({
    where: { id: req.params.dealId },
    include: { restaurant: true },
  });
  if (!dish || dish.restaurant.partnerId !== req.partnerId!) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  const parsed = createDealSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { modifiers, dealExpiresAt, ...rest } = parsed.data;
  const updated = await prisma.dish.update({
    where: { id: req.params.dealId },
    data: {
      ...rest,
      dealExpiresAt: dealExpiresAt ? new Date(dealExpiresAt) : undefined,
    },
    include: { modifiers: true },
  });
  // Update modifiers if provided
  if (modifiers) {
    await prisma.dishModifier.deleteMany({ where: { dishId: dish.id } });
    await prisma.dishModifier.createMany({
      data: modifiers.map((m) => ({ name: m, dishId: dish.id })),
    });
  }
  const result = await prisma.dish.findUnique({
    where: { id: req.params.dealId },
    include: { modifiers: true },
  });
  res.json(result);
});

// ── Pause/unpause deal (toggle dealType to null or restore) ──
partnerRouter.patch('/deals/:dealId/toggle', async (req, res) => {
  const dish = await prisma.dish.findUnique({
    where: { id: req.params.dealId },
    include: { restaurant: true },
  });
  if (!dish || dish.restaurant.partnerId !== req.partnerId!) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  // Toggle: if expires in past → extend by 24h, else expire now
  const now = new Date();
  const isActive = dish.dealExpiresAt > now;
  const updated = await prisma.dish.update({
    where: { id: req.params.dealId },
    data: {
      dealExpiresAt: isActive ? now : new Date(Date.now() + 86400000),
    },
  });
  res.json({ ...updated, isActive: !isActive });
});

// ── Delete deal ──
partnerRouter.delete('/deals/:dealId', async (req, res) => {
  const dish = await prisma.dish.findUnique({
    where: { id: req.params.dealId },
    include: { restaurant: true },
  });
  if (!dish || dish.restaurant.partnerId !== req.partnerId!) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  await prisma.dish.delete({ where: { id: req.params.dealId } });
  res.json({ success: true });
});

// ── Partner's reviews ──
partnerRouter.get('/reviews', async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { partnerId: req.partnerId! },
    select: { id: true },
  });
  const restaurantIds = restaurants.map((r) => r.id);
  const reviews = await prisma.review.findMany({
    where: { restaurantId: { in: restaurantIds } },
    include: { dish: { select: { name: true, image: true } }, restaurant: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(reviews);
});

// ── Image upload endpoint (Cloudinary) ──
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

partnerRouter.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'markdownmeals', resource_type: 'image' },
        (error, result) => {
          if (error || !result) reject(error || new Error('Upload failed'));
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});
