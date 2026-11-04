"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Plus,
  Users,
  ArrowRight,
  FileText,
  Info,
  Sprout,
  Waves,
  GraduationCap,
  Image,
  Video,
  Database,
  Loader2,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import AdminLayout from "@/components/Layout/AdminLayout";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAccommodations: 0,
    totalPackages: 0,
    totalExcursions: 0,
    totalReviews: 0,
    totalReels: 0,
    totalUsers: 0,
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          accommodationsRes,
          packagesRes,
          excursionsRes,
          reviewsRes,
          reelsRes,
          usersRes,
        ] = await Promise.all([
          fetch("/api/accommodations?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
          fetch("/api/packages?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
          fetch("/api/excursions?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
          fetch("/api/reviews?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
          fetch("/api/reels?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
          fetch("/api/users?limit=1000")
            .then((res) => res.json())
            .then((data) => ({
              data: Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                ? data
                : [],
            }))
            .catch(() => ({ data: [] })),
        ]);

        setStats({
          totalAccommodations: Array.isArray(accommodationsRes.data)
            ? accommodationsRes.data.length
            : 0,
          totalPackages: Array.isArray(packagesRes.data)
            ? packagesRes.data.length
            : 0,
          totalExcursions: Array.isArray(excursionsRes.data)
            ? excursionsRes.data.length
            : 0,
          totalReviews: Array.isArray(reviewsRes.data)
            ? reviewsRes.data.length
            : 0,
          totalReels: Array.isArray(reelsRes.data) ? reelsRes.data.length : 0,
          totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const handleSeedDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to seed the database? This will update existing content and add new items."
      )
    ) {
      return;
    }

    setIsSeeding(true);
    try {
      const response = await fetch("/api/seed-database", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database seeded successfully!",
        });
        // Refresh stats after seeding
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to seed database",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed database",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    {
      title: "Accommodations",
      value: stats.totalAccommodations,
      icon: Image,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/accommodations",
    },
    {
      title: "Packages",
      value: stats.totalPackages,
      icon: Video,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/packages",
    },
    {
      title: "Excursions",
      value: stats.totalExcursions,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/admin/excursions",
    },
    {
      title: "Reviews",
      value: stats.totalReviews,
      icon: UserCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/reviews",
    },
    {
      title: "Reels",
      value: stats.totalReels,
      icon: MessageSquare,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/admin/reels",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/users",
    },
  ];

  const quickActions = [
    {
      title: "Add Accommodation",
      description: "Create a new accommodation listing",
      icon: Image,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverColor: "hover:bg-primary/20",
      href: "/admin/accommodations/new",
    },
    {
      title: "Add Package",
      description: "Create a new package",
      icon: Video,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverColor: "hover:bg-primary/20",
      href: "/admin/packages/new",
    },
    {
      title: "Add Excursion",
      description: "Create a new excursion",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      hoverColor: "hover:bg-secondary/20",
      href: "/admin/excursions/new",
    },
    {
      title: "Add Review",
      description: "Add a new guest review",
      icon: UserCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverColor: "hover:bg-primary/20",
      href: "/admin/reviews/new",
    },
    {
      title: "Add Reel",
      description: "Add a new video reel",
      icon: Video,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      hoverColor: "hover:bg-secondary/20",
      href: "/admin/reels/new",
    },
  ];

  const seedDatabaseAction = {
    title: "Seed Database",
    description: "Populate database with initial content",
    icon: Database,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverColor: "hover:bg-amber-100",
    action: handleSeedDatabase,
  };

  const managementLinks = [
    {
      title: "Accommodations",
      description: "View and edit all accommodations",
      icon: Image,
      href: "/admin/accommodations",
    },
    {
      title: "Packages",
      description: "View and edit all packages",
      icon: Video,
      href: "/admin/packages",
    },
    {
      title: "Excursions",
      description: "View and edit all excursions",
      icon: Users,
      href: "/admin/excursions",
    },
    {
      title: "Reviews",
      description: "View and edit all reviews",
      icon: UserCircle,
      href: "/admin/reviews",
    },
    {
      title: "Reels",
      description: "View and edit all reels",
      icon: Video,
      href: "/admin/reels",
    },
    {
      title: "Users",
      description: "View and manage all users",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Home Page Content",
      description: "Edit homepage content and settings",
      icon: FileText,
      href: "/admin/home",
    },
    {
      title: "About Page Content",
      description: "Edit about page content and settings",
      icon: Info,
      href: "/admin/about",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard Overview
        </h1>

        {/* Analytics Section */}
        {/* <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Visitor Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 text-lg font-medium">
                Total Visitors
              </CardTitle>
              <div className="p-2 rounded-full bg-indigo-50">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl font-bold text-indigo-600">
                  {stats.analytics?.visitors?.value || 0}
                </p>
                <span className="text-gray-500 text-sm">visitors</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 text-lg font-medium">
                Page Views
              </CardTitle>
              <div className="p-2 rounded-full bg-cyan-50">
                <Eye className="w-5 h-5 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl font-bold text-cyan-600">
                  {stats.analytics?.pageviews?.value || 0}
                </p>
                <span className="text-gray-500 text-sm">views</span>
              </div>
            </CardContent>
          </Card>
   
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 text-lg font-medium">
                Avg. Visit Duration
              </CardTitle>
              <div className="p-2 rounded-full bg-teal-50">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl font-bold text-teal-600">
                  {Math.round(
                    (stats.analytics?.visit_duration?.value || 0) / 60
                  )}
                </p>
                <span className="text-gray-500 text-sm">min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div> */}

        {/* Content Statistics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Content Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={index} href={card.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-gray-700 text-lg font-medium">
                        {card.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${card.bgColor}`}>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline space-x-2">
                        <p className={`text-4xl font-bold ${card.color}`}>
                          {card.value}
                        </p>
                        <span className="text-gray-500 text-sm">items</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Card
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col justify-between hover:scale-105 ${action.hoverColor}`}
                  >
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`p-3 rounded-full ${action.bgColor} mx-auto mb-3`}
                      >
                        <Icon className={`w-6 h-6 ${action.color} mx-auto`} />
                      </div>
                      <CardTitle className="text-gray-700 text-lg font-medium">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 text-sm mb-3">
                        {action.description}
                      </p>
                      <Button
                        size="sm"
                        className={`w-full ${action.color
                          .replace("text", "bg")
                          .replace("-600", "-600")} hover:opacity-90`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            {/* Seed Database Card */}
            <Card
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col justify-between hover:scale-105 ${seedDatabaseAction.hoverColor}`}
              onClick={handleSeedDatabase}
            >
              <CardHeader className="text-center pb-2">
                <div
                  className={`p-3 rounded-full ${seedDatabaseAction.bgColor} mx-auto mb-3`}
                >
                  <Database
                    className={`w-6 h-6 ${seedDatabaseAction.color} mx-auto`}
                  />
                </div>
                <CardTitle className="text-gray-700 text-lg font-medium">
                  {seedDatabaseAction.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-3">
                  {seedDatabaseAction.description}
                </p>
                <Button
                  size="sm"
                  disabled={isSeeding}
                  className={`w-full bg-amber-600 hover:opacity-90`}
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Seed Database
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Links Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Content Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} href={link.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-50">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-700 text-lg font-medium">
                            {link.title}
                          </CardTitle>
                          <p className="text-gray-600 text-sm">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
}
