import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'foodman-secret-key-change-in-prod';

export function signToken(payload: { id: string; role: 'partner' | 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; role: 'partner' | 'admin' } {
  return jwt.verify(token, JWT_SECRET) as { id: string; role: 'partner' | 'admin' };
}

export function requirePartner(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = verifyToken(header.slice(7));
    if (decoded.role !== 'partner') {
      res.status(403).json({ error: 'Partner access required' });
      return;
    }
    req.partnerId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = verifyToken(header.slice(7));
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
