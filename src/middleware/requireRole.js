import prisma from "../lib/prisma.js";

export function requireRole(role) {
  return async (req, res, next) => {
    const profile = await prisma.profiles.findUnique({
      where: { id: req.user.id },
    });

    if (!profile || profile.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
}
