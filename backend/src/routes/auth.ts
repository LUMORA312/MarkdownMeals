import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signToken } from '../middleware/auth.js';

export const authRouter = Router();

// ── Partner Signup ──
const partnerSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(1),
  phone: z.string().optional(),
});

authRouter.post('/partner/signup', async (req, res) => {
  const parsed = partnerSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password, businessName, phone } = parsed.data;

  const existing = await prisma.partner.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const partner = await prisma.partner.create({
    data: { email, password: hashed, businessName, phone },
  });

  const token = signToken({ id: partner.id, role: 'partner' });
  res.status(201).json({
    token,
    partner: { id: partner.id, email: partner.email, businessName: partner.businessName },
  });
});

// ── Partner Login ──
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/partner/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  const partner = await prisma.partner.findUnique({ where: { email } });
  if (!partner || !(await bcrypt.compare(password, partner.password))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ id: partner.id, role: 'partner' });
  res.json({
    token,
    partner: { id: partner.id, email: partner.email, businessName: partner.businessName },
  });
});

// ── Admin Login ──
authRouter.post('/admin/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ id: admin.id, role: 'admin' });
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
});

// ── Get current user (partner or admin) ──
authRouter.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const { verifyToken } = await import('../middleware/auth.js');
    const decoded = verifyToken(header.slice(7));
    if (decoded.role === 'partner') {
      const partner = await prisma.partner.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, businessName: true, phone: true, createdAt: true },
      });
      if (!partner) { res.status(404).json({ error: 'Partner not found' }); return; }
      res.json({ role: 'partner', user: partner });
    } else {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, createdAt: true },
      });
      if (!admin) { res.status(404).json({ error: 'Admin not found' }); return; }
      res.json({ role: 'admin', user: admin });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});
