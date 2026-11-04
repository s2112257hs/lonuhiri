import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getReels, createReel } from "@/controller/reelController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { method } = req;

  switch (method) {
    case "GET":
      return getReels(req, res);

    case "POST":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return createReel(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

