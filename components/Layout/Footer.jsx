import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";
import { siteContact } from "@/lib/siteContact";

export function Footer() {
  return (
    <footer className="text-secondary-foreground bg-gradient-to-b from-white to-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${siteContact.instagramUrl ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-8`}>
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Lonuhiri</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Your home away from home. Experience comfort, luxury, and
              unforgettable memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/accommodations"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Accommodations
              </Link>
              <Link
                href="/packages"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Packages
              </Link>
              <Link
                href="/excursions"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Excursions
              </Link>
              <Link href="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3">
              <a href={`tel:${siteContact.phone}`} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone size={16} />
                <span>{siteContact.phone}</span>
              </a>
              <a href={`mailto:${siteContact.email}`} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail size={16} />
                <span>{siteContact.email}</span>
              </a>
            </div>
          </div>

          {/* Social */}
          {siteContact.instagramUrl && <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Follow Us</h3>
            <div className="flex gap-4">
              <Link
                href={siteContact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </Link>
            </div>
          </div>}
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>
            &copy; {new Date().getFullYear()} Lonuhiri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
