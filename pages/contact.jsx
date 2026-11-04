import { useRef, useState } from "react";
import { contactEmailConfiguration } from "@/lib/contactEmail";
import Head from "next/head";
import { Mail, MessageCircle } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";

export default function ContactPage({ emailReady = false }) {
  const [hasBooking, setHasBooking] = useState("no");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const submission = useRef(null);
  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setSucceeded(false);
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const payload = { name: form.get("name"), email: form.get("email"), message: form.get("message"), hasBooking: hasBooking === "yes", bookingNumber: hasBooking === "yes" ? form.get("bookingNumber") : "", website: form.get("website") };
    const fingerprint = JSON.stringify(payload);
    if (submission.current?.fingerprint !== fingerprint) submission.current = { fingerprint, requestId: crypto.randomUUID() };
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: submission.current.requestId }),
      });
      const data = await response.json();
      setStatus(data.message || "Unable to send your message. Please try again.");
      if (response.ok && data.success) {
        setSucceeded(true);
        formElement.reset();
        setHasBooking("no");
        submission.current = null;
      }
    } catch { setStatus("Unable to send your message. Please try again. Your details are still here."); }
    finally { setSending(false); }
  }
  const fieldClass = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20";
  return (
    <MainLayout>
      <Head><title>Contact Us | Lonuhiri</title><meta name="description" content="Get in touch with Lonuhiri about your stay, reservation, or travel plans." /></Head>
      <section className="px-4 pb-16 pt-32 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-700">We’re here to help</p>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Contact us</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">Planning your island escape, or have a question about your stay? Tell us a little more and we’ll help you with the details.</p>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
            <aside className="space-y-6 rounded-2xl bg-teal-800 p-8 text-white self-start">
              <MessageCircle className="h-8 w-8" /><h2 className="text-xl font-semibold">Let’s talk about your stay</h2><p className="text-sm leading-relaxed text-teal-50">Ask about accommodation, packages, excursions, or an existing reservation.</p>
              <div className="border-t border-white/20 pt-6"><Mail className="mb-3 h-5 w-5" /><h3 className="font-medium">Already booked?</h3><p className="mt-2 text-sm leading-relaxed text-teal-50">Include your booking number so we can find your reservation more easily.</p></div>
            </aside>
            <form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {!emailReady && <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Email delivery is temporarily unavailable. You can email booking@lonuhiri.com directly.</div>}
              <div className="hidden" aria-hidden="true"><label htmlFor="contact-website">Leave this empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-800" htmlFor="contact-name">Your name <span aria-hidden="true">*</span><input id="contact-name" name="name" required maxLength={100} autoComplete="name" placeholder="Full name" className={fieldClass} /></label>
                <label className="text-sm font-medium text-gray-800" htmlFor="contact-email">Email address <span aria-hidden="true">*</span><input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className={fieldClass} /></label>
              </div>
              <fieldset><legend className="text-sm font-medium text-gray-800">Do you have a booking reservation?</legend><div className="mt-3 flex flex-wrap gap-6">{["no", "yes"].map((value) => <label key={value} className="flex items-center gap-2 text-sm text-gray-700"><input type="radio" name="hasBooking" value={value} checked={hasBooking === value} onChange={() => setHasBooking(value)} className="accent-teal-700" />{value === "yes" ? "Yes, I have a reservation" : "No, not yet"}</label>)}</div></fieldset>
              {hasBooking === "yes" && <label className="block text-sm font-medium text-gray-800" htmlFor="booking-number">Booking number <span aria-hidden="true">*</span><input id="booking-number" name="bookingNumber" required maxLength={100} placeholder="Your booking reference" className={fieldClass} /><span className="mt-2 block text-xs text-gray-500">You can find this in your booking confirmation.</span></label>}
              <label className="block text-sm font-medium text-gray-800" htmlFor="contact-message">Your message <span aria-hidden="true">*</span><textarea id="contact-message" name="message" rows={6} required minLength={10} maxLength={5000} placeholder="How can we help with your stay?" className={fieldClass} /></label>
              <p className="text-xs text-gray-500">Fields marked * are required.</p>
              {status && <p role="status" className={`rounded-lg p-4 text-sm ${succeeded ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"}`}>{status}</p>}
              <Button type="submit" disabled={sending} className="w-full bg-teal-800 hover:bg-teal-900 sm:w-auto">{sending ? "Sending…" : "Send message"}</Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export function getServerSideProps() {
  return { props: { emailReady: contactEmailConfiguration().configured } };
}
