import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { GoogleReviewsError } from "@/lib/googleReviews";
import { syncGoogleReviews, getGoogleReviewSyncStatus } from "@/lib/googleReviewService";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== "admin") {
    return res.status(401).json({ success: false, message: "Admin access required" });
  }
  if (req.method === "GET") {
    try {
      return res.status(200).json({ success: true, data: await getGoogleReviewSyncStatus() });
    } catch {
      return res.status(500).json({ success: false, message: "Could not check Google sync status. Please try again." });
    }
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return res.status(415).json({ success: false, message: "Use application/json" });
  }
  try {
    const result = await syncGoogleReviews({ force: true });
    if (result.skipped) return res.status(409).json({ success: false, message: "A Google review sync is already running. Please wait." });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error instanceof GoogleReviewsError ? error.status : 500).json({
      success: false,
      message: error instanceof GoogleReviewsError ? error.message : "Reviews could not be saved. Please try syncing again.",
    });
  }
}
