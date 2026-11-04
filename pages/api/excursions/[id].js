import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import {
  getExcursion,
  updateExcursion,
  deleteExcursion,
} from "@/controller/excursionController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { method } = req;
  req.query.id = req.query.id || req.query.slug;

  switch (method) {
    case "GET":
      return getExcursion(req, res);

    case "PUT":
    case "PATCH":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return updateExcursion(req, res);

    case "DELETE":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return deleteExcursion(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

