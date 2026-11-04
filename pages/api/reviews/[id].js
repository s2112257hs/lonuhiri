import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import {
  getReview,
  updateReview,
  deleteReview,
} from "@/controller/reviewController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  req.isReviewAdmin = session?.user?.role === "admin";

  const { method } = req;

  switch (method) {
    case "GET":
      return getReview(req, res);

    case "PUT":
    case "PATCH":
      if (!req.isReviewAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return updateReview(req, res);

    case "DELETE":
      if (!req.isReviewAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return deleteReview(req, res);

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

