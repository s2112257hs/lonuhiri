import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUser, updateUser, deleteUser } from "@/controller/userController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  res.setHeader("Cache-Control", "no-store");
  if (!session) return res.status(401).json({ success: false, message: "Please sign in." });
  if (session.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  req.actorId = session.user.id;

  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case "GET":
      return getUser(req, res);

    case "PUT":
    case "PATCH":
      return updateUser(req, res);

    case "DELETE":
      return deleteUser(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}
