import "dotenv/config";
import express from "express";
import leaveRoutes from "./routes/leave.routes.js";
import gatePassRoutes from "./routes/gatepass.routes.js";
const app = express();
app.use(express.json());

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// routes
app.use("/leave", leaveRoutes);
app.use("/gatepass",gatePassRoutes)

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 LAST
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
