// middleware/requireAuth.js
import { supabaseAuth } from "../lib/supabase.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const token = authHeader.slice("Bearer ".length);

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}
  