import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getReel, updateReel, deleteReel } from "@/controller/reelController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { method } = req;

  switch (method) {
    case "GET":
      return getReel(req, res);

    case "PUT":
    case "PATCH":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return updateReel(req, res);

    case "DELETE":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return deleteReel(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

