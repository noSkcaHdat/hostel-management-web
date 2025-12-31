import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getWeeklyMenu,
  createMenu,
  getMyBookings,
  createBooking,
  cancelBooking,
  getBookingsByDate,
  getMealStats,
} from "../controllers/meal.controller.js";

const router = Router();

// Public/Student routes
router.get("/menu", getWeeklyMenu);
router.get("/bookings/my", requireAuth, requireRole("student"), getMyBookings);
router.post("/bookings", requireAuth, requireRole("student"), createBooking);
router.delete("/bookings/:id", requireAuth, requireRole("student"), cancelBooking);

// Admin/Warden routes
router.post("/menu", requireAuth, requireRole("warden"), createMenu);
router.get("/bookings/date/:date", requireAuth, requireRole("warden"), getBookingsByDate);
router.get("/stats", requireAuth, requireRole("warden"), getMealStats);

export default router;