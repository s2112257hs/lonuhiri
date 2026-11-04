import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getReviews, createReview } from "@/controller/reviewController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  req.isReviewAdmin = session?.user?.role === "admin";

  const { method } = req;

  switch (method) {
    case "GET":
      return getReviews(req, res);

    case "POST":
      if (!req.isReviewAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return createReview(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

