import { validateContactInput } from "@/lib/contactValidation";
import { deliverContactEmail } from "@/lib/contactEmail";
import { createHash } from "node:crypto";

// Best-effort abuse protection per server instance, supplemented by a honeypot.
const attempts = new Map();
function isRateLimited(email) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  const key = createHash("sha256").update(email).digest("hex");
  const entry = attempts.get(key) || { count: 0, expires: now + 10 * 60 * 1000 };
  if (entry.count >= 5 || attempts.size >= 10000) return true;
  entry.count++;
  attempts.set(key, entry);
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) return res.status(415).json({ success: false, message: "Use application/json" });
  const { data, error } = validateContactInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }
  if (req.body.website) return res.status(400).json({ success: false, message: "Unable to submit this form." });
  if (req.body.requestId !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.body.requestId)) {
    return res.status(400).json({ success: false, message: "Invalid enquiry reference. Please reload the page." });
  }
  if (isRateLimited(data.email)) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ success: false, message: "Too many messages. Please wait ten minutes before trying again." });
  }
  const result = await deliverContactEmail(data, { requestId: req.body.requestId });
  return res.status(result.status).json({ success: result.success, message: result.message });
}
