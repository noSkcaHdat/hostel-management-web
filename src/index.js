import "dotenv/config";
import express from "express";
import cors from "cors";
import leaveRoutes from "./routes/leave.routes.js";
import gatePassRoutes from "./routes/gatepass.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import prisma from "./lib/prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// profile endpoint
app.get("/profile", requireAuth, async (req, res) => {
  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: req.user.id },
    });
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// routes
app.use("/leave", leaveRoutes);
app.use("/gatepass",gatePassRoutes)
app.use("/meals", mealRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 LAST
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
