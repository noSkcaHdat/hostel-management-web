import prisma from "../lib/prisma.js";

// GET /gatepass/verify?code=GP-xxxx
export async function verifyGatePass(req, res, next) {
  try {
    const code = String(req.query.code || "");
    if (!code) return res.status(400).json({ error: "code required" });

    // Use case-insensitive search for gate pass verification
    const gatePass = await prisma.gate_passes.findFirst({
      where: {
        pass_code: {
          equals: code,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      include: {
        leave_requests: {
          include: {
            profiles: { select: { id: true, email: true, role: true } },
          },
        },
      },
    });

    if (!gatePass) return res.status(404).json({ error: "Invalid gate pass" });

    res.json({
      pass_code: gatePass.pass_code,
      status: gatePass.status,
      issued_at: gatePass.issued_at,
      used_at: gatePass.used_at,
      leave_from: gatePass.leave_requests.from_date,
      leave_to: gatePass.leave_requests.to_date,
      reason: gatePass.leave_requests.reason,
      student: gatePass.leave_requests.profiles,
    });
  } catch (err) {
    next(err);
  }
}

// POST /gatepass/use  body: { code }
export async function useGatePass(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code required" });

    // Use case-insensitive search for gate pass
    const gp = await prisma.gate_passes.findFirst({
      where: {
        pass_code: {
          equals: code,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });
    if (!gp) return res.status(404).json({ error: "Invalid gate pass" });

    if (gp.status === "used") {
      return res.status(409).json({ error: "Already used", used_at: gp.used_at });
    }

    // Use the original pass_code from database (preserves case)
    const updated = await prisma.gate_passes.update({
      where: { pass_code: gp.pass_code },
      data: { status: "used", used_at: new Date() },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
