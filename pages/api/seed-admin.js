import { timingSafeEqual } from "node:crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { validateUserInput, userErrorResponse } from "@/lib/userValidation";

// Retained for explicit initial setup/recovery; no hardcoded credentials.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const supplied = req.headers.authorization?.replace(/^Bearer /, "");
  const bootstrap = expected && supplied && Buffer.byteLength(expected) === Buffer.byteLength(supplied) && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
  // Recovery must also work when the stored account hash is unusable.
  const session = bootstrap ? null : await getServerSession(req, res, authOptions);
  if (!bootstrap && session?.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access or a configured bootstrap token is required." });
  const { data, error } = validateUserInput({ ...req.body, role: "admin" }, { create: true });
  if (error) return res.status(400).json({ success: false, message: error });
  try {
    await connectToDatabase();
    const email = data.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await User.findOne({ email: { $regex: `^${email}$`, $options: "i" } }).select("+password");
    if (existing) {
      if (!bootstrap || req.body.resetPassword !== true) return res.status(409).json({ success: false, message: "Account already exists. Recovery requires a bootstrap token and resetPassword: true." });
      existing.name = data.name;
      existing.password = data.password;
      existing.role = "admin";
      existing.sessionVersion = (existing.sessionVersion || 0) + 1;
      await existing.save();
      return res.status(200).json({ success: true, message: "Admin password reset. Sign in with the new password." });
    }
    await User.create(data);
    return res.status(201).json({ success: true, message: "Admin account created." });
  } catch (error) {
    const failure = userErrorResponse(error);
    return res.status(failure.status).json({ success: false, message: failure.message });
  }
}
