import { Toaster } from "@/components/ui/toaster";

import OGCard from "../og-card";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { WhatsAppFloatButton } from "@/components/ui/whatsapp-float-button";

export default function MainLayout({ children, isTextBlack }) {
  return (
    <div className="min-h-screen flex flex-col">
      <OGCard />
      <WhatsAppFloatButton />
      <Navigation />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />

      <Toaster />
    </div>
  );
}
