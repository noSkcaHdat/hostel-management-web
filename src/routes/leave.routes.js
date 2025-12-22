import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  applyLeave,
  myLeaves,
  pendingLeaves,
  approveLeave,
  rejectLeave,
  getGatePass,
} from "../controllers/leave.controller.js";

const router = Router();

// student
router.post("/apply", requireAuth, requireRole("student"), applyLeave);
router.get("/my", requireAuth, requireRole("student"), myLeaves);

// warden
router.get("/pending", requireAuth, requireRole("warden"), pendingLeaves);
router.post("/:id/approve", requireAuth, requireRole("warden"), approveLeave);
router.post("/:id/reject", requireAuth, requireRole("warden"), rejectLeave);

// gate pass
router.get("/:id/gatepass", requireAuth, getGatePass);

export default router;
