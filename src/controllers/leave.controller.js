import prisma from "../lib/prisma.js";

// POST /leave/apply
export async function applyLeave(req, res, next) {
  try {
    const { from_date, to_date, reason } = req.body;

    if (!from_date || !to_date || !reason) {
      return res.status(400).json({ error: "from_date, to_date, and reason are required" });
    }

    const leave = await prisma.leave_requests.create({
      data: {
        student_id: req.user.id,
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        reason,
        status: "pending",
      },
    });

    res.json(leave);
  } catch (err) {
    next(err);
  }
}
// export async function getGatePass(req, res, next) {
//   try {
//     return res.status(501).json({ error: "Gate pass not implemented yet" });
//   } catch (err) {
//     next(err);
//   }
// }


// GET /leave/my
export async function myLeaves(req, res, next) {
  try {
    const leaves = await prisma.leave_requests.findMany({
      where: { student_id: req.user.id },
      orderBy: { created_at: "desc" },
    });

    res.json(leaves);
  } catch (err) {
    next(err);
  }
}

// GET /leave/pending
export async function pendingLeaves(req, res, next) {
  try {
    const pending = await prisma.leave_requests.findMany({
      where: { status: "pending" },
      orderBy: { created_at: "desc" },
      include: {
        profiles: {
          select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    res.json(pending);
  } catch (err) {
    next(err);
  }
}

// POST /leave/:id/approve
export async function approveLeave(req, res, next) {
  try {
    const leaveId = req.params.id;

    // 1) Approve leave
    const leave = await prisma.leave_requests.update({
      where: { id: leaveId },
      data: { status: "approved" },
    });

    // 2) Create gate pass (if not exists)
    const passCode = `GP-${leaveId.slice(0, 8)}-${Date.now()}`;

    const gatePass = await prisma.gate_passes.upsert({
      where: { leave_request_id: leaveId },
      update: {}, // already exists → keep it
      create: {
        leave_request_id: leaveId,
        pass_code: passCode,
        status: "issued",
      },
    });

    res.json({ leave, gatePass });
  } catch (err) {
    next(err);
  }
}


// POST /leave/:id/reject
export async function rejectLeave(req, res, next) {
  try {
    const rejected = await prisma.leave_requests.update({
      where: { id: req.params.id },
      data: { status: "rejected" },
    });

    res.json(rejected);
  } catch (err) {
    next(err);
  }
}
export async function getGatePass(req, res, next) {
  try {
    const leaveId = req.params.id;

    const leave = await prisma.leave_requests.findUnique({
      where: { id: leaveId },
    });
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    if (leave.status !== "approved") {
      return res.status(403).json({ error: "Gate pass available only after approval" });
    }

    const gatePass = await prisma.gate_passes.findUnique({
      where: { leave_request_id: leaveId },
    });
    if (!gatePass) return res.status(404).json({ error: "Gate pass not found" });

    res.json(gatePass);
  } catch (err) {
    next(err);
  }
}
// GET /gatepass/verify?code=GP-xxxx
export async function verifyGatePass(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "code required" });

    const gatePass = await prisma.gate_passes.findUnique({
      where: { pass_code: String(code) },
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
      student: gatePass.leave_requests.profiles,
      reason: gatePass.leave_requests.reason,
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

    const gatePass = await prisma.gate_passes.findUnique({
      where: { pass_code: code },
    });
    if (!gatePass) return res.status(404).json({ error: "Invalid gate pass" });

    if (gatePass.status === "used") {
      return res.status(409).json({ error: "Gate pass already used", used_at: gatePass.used_at });
    }

    const updated = await prisma.gate_passes.update({
      where: { pass_code: code },
      data: { status: "used", used_at: new Date() },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
