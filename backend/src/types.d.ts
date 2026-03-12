declare namespace Express {
  interface Request {
    sessionId: string;
    partnerId?: string;
    adminId?: string;
  }
}
