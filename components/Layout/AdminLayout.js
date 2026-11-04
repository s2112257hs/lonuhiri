"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Home,
  Info,
  Users,
  ChevronDown,
  Bed,
  Briefcase,
  Video,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (status !== "loading" && session?.user?.role !== "admin") router.replace("/auth/login");
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") return null;

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const menuItems = [
    {
      section: "Main",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Home, label: "Home Page", href: "/admin/home" },
        { icon: Info, label: "About Us", href: "/admin/about" },
      ],
    },
    {
      section: "Content",
      items: [
        { icon: Bed, label: "Accommodations", href: "/admin/accommodations" },
        { icon: Briefcase, label: "Packages", href: "/admin/packages" },
        { icon: Video, label: "Excursions", href: "/admin/excursions" },
        { icon: Star, label: "Reviews", href: "/admin/reviews" },
        { icon: Video, label: "Reels", href: "/admin/reels" },
        { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
      ],
    },
    {
      section: "Settings",
      items: [{ icon: Users, label: "Users", href: "/admin/users" }],
    },
  ];

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 shadow-sm">
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 md:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-900">
                  Admin Portal
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Separator orientation="vertical" className="h-8" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium text-gray-900">
                        {session.user.name}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${session.user.id}`}>Profile &amp; password</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out overflow-y-auto",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="h-full flex flex-col py-4">
            {menuItems.map((section, sectionIndex) => (
              <div key={section.section} className="px-3 mb-6">
                <h2 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            isActive ? "text-primary" : "text-gray-500"
                          )}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                {sectionIndex < menuItems.length - 1 && (
                  <Separator className="my-4 mx-3" />
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Toaster />
    </div>
  );
}
