export const CONTACT_RECIPIENT = "booking@lonuhiri.com";

export function validateContactInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Please complete the contact form." };
  }
  const { name, email, message, hasBooking, bookingNumber } = body;
  if (typeof name !== "string" || !name.trim() || name.length > 100 || /[\r\n]/.test(name) ||
      typeof email !== "string" || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      typeof message !== "string" || message.trim().length < 10 || message.length > 5000 ||
      typeof hasBooking !== "boolean" ||
      (hasBooking && (typeof bookingNumber !== "string" || !bookingNumber.trim() || bookingNumber.length > 100 || /[\r\n]/.test(bookingNumber)))) {
    return { error: "Please provide your name, a valid email, a message of at least 10 characters, and your booking number if you have a reservation." };
  }
  return {
    data: {
      name: name.trim(), email: email.trim().toLowerCase(), message: message.trim(),
      hasBooking, bookingNumber: hasBooking ? bookingNumber.trim() : "",
    },
  };
}
