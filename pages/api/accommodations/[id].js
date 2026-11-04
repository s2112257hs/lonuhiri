import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import {
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from "@/controller/accommodationController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { method } = req;
  req.query.id = req.query.id || req.query.slug;

  switch (method) {
    case "GET":
      return getAccommodation(req, res);

    case "PUT":
    case "PATCH":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return updateAccommodation(req, res);

    case "DELETE":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return deleteAccommodation(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

