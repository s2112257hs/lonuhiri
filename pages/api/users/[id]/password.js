import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { updateUser } from "@/controller/userController";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ success: false, message: "Please sign in." });
  if (session.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }
  req.actorId = session.user.id;
  req.userPasswordOnly = true;
  return updateUser(req, res);
}
