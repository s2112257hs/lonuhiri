import { createHmac, randomUUID } from "node:crypto";
import { CONTACT_RECIPIENT } from "./contactValidation.js";

export function contactEmailConfiguration(env = process.env) {
  const domain = env.CONTACT_ALIAS_DOMAIN?.trim().toLowerCase() || "messages.lonuhiri.com";
  const missing = ["RESEND_API_KEY", "CONTACT_ALIAS_SECRET"].filter((key) => !env[key]?.trim());
  const validDomain = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
  return { configured: !missing.length && validDomain, domain, missing };
}

export function buildContactEmail(contact, { domain, aliasSecret, requestId }) {
  // A guest's claimed booking reference is a label, not proof of a reservation.
  // Include the guest email so two people cannot obtain the same booking alias.
  const aliasId = contact.hasBooking
    ? createHmac("sha256", aliasSecret).update(JSON.stringify([contact.email, contact.bookingNumber])).digest("hex").slice(0, 24)
    : requestId.replace(/-/g, "");
  const alias = `guest-${aliasId}@${domain}`;
  const reference = contact.hasBooking ? `Booking ${contact.bookingNumber}` : "New enquiry";
  return {
    from: `Lonuhiri guest enquiry <${alias}>`,
    to: [CONTACT_RECIPIENT],
    reply_to: contact.email,
    subject: `[Lonuhiri] ${reference} — ${contact.name}`,
    text: [
      "New message from the Lonuhiri contact form", "",
      `Name: ${contact.name}`, `Email: ${contact.email}`,
      `Has a reservation: ${contact.hasBooking ? "Yes" : "No"}`,
      ...(contact.hasBooking ? [`Booking reference (provided by guest): ${contact.bookingNumber}`] : []),
      "", contact.message, "",
      "Reply to this email to contact the guest directly.",
      `Enquiry reference: ${requestId}`,
    ].join("\n"),
  };
}

export async function deliverContactEmail(contact, { env = process.env, fetchImpl = fetch, requestId = randomUUID() } = {}) {
  const config = contactEmailConfiguration(env);
  if (!config.configured) return { success: false, status: 503, message: "Email delivery is temporarily unavailable. Please email booking@lonuhiri.com directly. Your details are still in the form." };
  const email = buildContactEmail(contact, { domain: config.domain, aliasSecret: env.CONTACT_ALIAS_SECRET.trim(), requestId });
  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`, "Content-Type": "application/json", "Idempotency-Key": `contact-${requestId}` },
      body: JSON.stringify(email),
    });
    if (!response.ok) return { success: false, status: 502, message: "Your message could not be sent. Please try again or email booking@lonuhiri.com directly. Your details are still in the form." };
    const data = await response.json();
    if (!data.id) throw new Error("Missing provider message ID");
    return { success: true, status: 200, message: "Your message has been sent to our booking team. We’ll reply to the email address you provided." };
  } catch {
    return { success: false, status: 502, message: "We couldn’t confirm that your message was sent. Please try again. Your details are still in the form." };
  }
}
