"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/accommodations", label: "Accommodations" },
    { href: "/packages", label: "Packages" },
    { href: "/excursions", label: "Excursions" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="absolute inset-0 mx-auto z-50 h-20 bg-transparent">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`text-2xl font-semibold ${
              isHomePage ? "text-white" : "text-foreground"
            }`}
          >
            Lonuhiri
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors font-semibold ${
                    isActive
                      ? "text-secondary font-bold"
                      : isHomePage
                      ? "text-white hover:text-white/80 "
                      : "text-foreground hover:text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button
              asChild
              size="sm"
              className="bg-secondary text-secondary-foreground"
            >
              <Link href="/accommodations">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Navigation Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={`md:hidden ${
                  isHomePage ? "text-white" : "text-foreground"
                }`}
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={`text-base font-medium transition-colors py-2 ${
                          isActive
                            ? "text-secondary font-semibold"
                            : "text-foreground hover:text-foreground/80"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <Button
                    asChild
                    size="sm"
                    className="w-full mt-4 bg-secondary text-secondary-foreground"
                  >
                    <Link href="/accommodations">Book Now</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
