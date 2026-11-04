import {
  getHome,
  createHome,
  updateHome,
} from "../../../controller/homeController.js";
import connectDB from "../../../lib/mongodb.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (["POST", "PUT"].includes(req.method)) {
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
  }
  await connectDB();

  switch (req.method) {
    case "GET":
      return getHome(req, res);
    case "POST":
      return createHome(req, res);
    case "PUT":
      return updateHome(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return res
        .status(405)
        .json({ message: `Method ${req.method} not allowed` });
  }
}
