import {
  getAbout,
  updateAbout,
} from "@/controller/aboutController";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (["PUT", "PATCH"].includes(req.method)) {
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  }
  const { method } = req;

  switch (method) {
    case "GET":
      return getAbout(req, res);
    case "PUT":
    case "PATCH":
      return updateAbout(req, res);
    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH"]);
      return res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`,
      });
  }
}

