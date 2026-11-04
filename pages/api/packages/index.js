import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getPackages, createPackage } from "@/controller/packageController";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { method } = req;

  switch (method) {
    case "GET":
      return getPackages(req, res);

    case "POST":
      if (session?.user?.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      return createPackage(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

