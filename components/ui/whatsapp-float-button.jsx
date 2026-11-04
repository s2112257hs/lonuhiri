"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { siteContact } from "@/lib/siteContact";

export function WhatsAppFloatButton({ phoneNumber, message }) {
  const defaultPhone = phoneNumber || siteContact.whatsapp;

  // Remove all non-numeric characters except + for WhatsApp
  const cleanPhone = defaultPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <Button
      asChild
      size="icon"
      className="fixed bottom-[20px] right-6 z-40 rounded-2xl h-12 w-32 flex items-center justify-center shadow-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Contact us on WhatsApp"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-6 w-6" />
        WhatsApp Us
      </a>
    </Button>
  );
}
