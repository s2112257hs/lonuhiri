import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUsers, createUser } from "@/controller/userController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  res.setHeader("Cache-Control", "no-store");
  if (!session) return res.status(401).json({ success: false, message: "Please sign in." });
  if (session.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  req.actorId = session.user.id;

  const { method } = req;

  switch (method) {
    case "GET":
      return getUsers(req, res);

    case "POST":
      return createUser(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}
