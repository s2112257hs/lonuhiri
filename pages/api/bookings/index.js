import { getBookings, createBooking } from "@/controller/bookingController";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET": {
      const session = await getServerSession(req, res, authOptions);
      if (session?.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required." });
      return getBookings(req, res);
    }

    case "POST":
      return createBooking(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
  }
}

