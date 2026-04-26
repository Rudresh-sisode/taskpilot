import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface AuthRequest extends Request {
  userId?: string;
}

export async function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : queryToken;

  if (!token) {
    res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing token" } });
    return;
  }
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } });
    return;
  }

  req.userId = data.user.id;
  next();
}
