import test from "node:test";
import assert from "node:assert/strict";
import { CONTACT_RECIPIENT, validateContactInput } from "../lib/contactValidation.js";
import { buildContactEmail, deliverContactEmail, contactEmailConfiguration } from "../lib/contactEmail.js";

const valid = { name: "Guest", email: "guest@example.com", message: "Question about my stay", hasBooking: false };

test("contact delivery destination is the booking inbox", () => {
  assert.equal(CONTACT_RECIPIENT, "booking@lonuhiri.com");
});

const emailEnv = { RESEND_API_KEY: "fake-api-key", CONTACT_ALIAS_SECRET: "fake-alias-secret", CONTACT_ALIAS_DOMAIN: "messages.lonuhiri.com" };
const requestId = "1e946a48-332a-4971-aa77-f5fa177bca35";

test("contact email goes to the fixed inbox and replies go to the guest", () => {
  const email = buildContactEmail(valid, { domain: emailEnv.CONTACT_ALIAS_DOMAIN, aliasSecret: emailEnv.CONTACT_ALIAS_SECRET, requestId });
  assert.deepEqual(email.to, ["booking@lonuhiri.com"]);
  assert.equal(email.reply_to, valid.email);
  assert.match(email.from, /guest-[a-f0-9]+@messages\.lonuhiri\.com/);
  assert.ok(email.text.includes(valid.message));
});

test("booking aliases are stable for a guest/reference pair and separate different guests", () => {
  const options = { domain: emailEnv.CONTACT_ALIAS_DOMAIN, aliasSecret: emailEnv.CONTACT_ALIAS_SECRET, requestId };
  const contact = { ...valid, hasBooking: true, bookingNumber: "LH123" };
  const first = buildContactEmail(contact, options);
  const second = buildContactEmail(contact, { ...options, requestId: "another-request" });
  assert.equal(first.from, second.from);
  assert.notEqual(first.from, buildContactEmail({ ...contact, email: "other@example.com" }, options).from);
  assert.ok(first.text.includes("Booking reference (provided by guest): LH123"));
});

test("missing email settings make no delivery request", async () => {
  assert.equal(contactEmailConfiguration({}).configured, false);
  const result = await deliverContactEmail(valid, { env: {}, fetchImpl: () => { throw new Error("Network must not be reached"); } });
  assert.equal(result.status, 503);
  assert.equal(result.success, false);
});

test("sending is idempotent and reports success only after provider acceptance", async () => {
  let sent;
  const result = await deliverContactEmail(valid, { env: emailEnv, requestId, fetchImpl: async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], `contact-${requestId}`);
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: "provider-message-id" }) };
  } });
  assert.equal(sent.reply_to, valid.email);
  assert.equal(result.success, true);
  assert.equal(result.status, 200);
});

test("provider failures cannot produce false success or expose credentials", async () => {
  for (const fetchImpl of [async () => ({ ok: false }), async () => { throw new Error("fake-api-key"); }, async () => ({ ok: true, json: async () => ({}) })]) {
    const result = await deliverContactEmail(valid, { env: emailEnv, requestId, fetchImpl });
    assert.equal(result.success, false);
    assert.equal(result.status, 502);
    assert.equal(result.message.includes(emailEnv.RESEND_API_KEY), false);
  }
});

test("normalizes contact fields and removes booking references for non-reservation messages", () => {
  const result = validateContactInput({ ...valid, name: " Guest ", email: "Guest@Example.com", bookingNumber: "ignored" });
  assert.equal(result.data.name, "Guest");
  assert.equal(result.data.email, "guest@example.com");
  assert.equal(result.data.bookingNumber, "");
});

test("reservation inquiries require a booking number", () => {
  assert.ok(validateContactInput({ ...valid, hasBooking: true }).error);
  assert.equal(validateContactInput({ ...valid, hasBooking: true, bookingNumber: "LH123" }).data.bookingNumber, "LH123");
});

test("rejects malformed input and email header injection", () => {
  for (const body of [null, [], { ...valid, email: "bad" }, { ...valid, name: "Guest\r\nBcc:other@example.com" }, { ...valid, email: "guest@example.com\r\n" }, { ...valid, message: "short" }]) {
    assert.ok(validateContactInput(body).error);
  }
});
