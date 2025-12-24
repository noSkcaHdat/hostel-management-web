import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { verifyGatePass, useGatePass } from "../controllers/gatepass.controller.js";

const router = Router();

// security/warden can verify + use
router.get("/verify", requireAuth, requireRole("warden"), verifyGatePass);
router.post("/use", requireAuth, requireRole("warden"), useGatePass);

export default router;
