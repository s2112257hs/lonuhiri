import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Layout/AdminLayout";
import HomeForm from "@/components/admin/HomeForm";
import { Toaster } from "@/components/ui/toaster";

export default function AdminHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchHomeData();
  }, [session, status, router]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch("/api/home");
      if (response.ok) {
        const data = await response.json();
        setHomeData(data);
      } else if (response.status === 404) {
        // No home data exists yet
        setHomeData(null);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (data) => {
    setHomeData(data);
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Home Content Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your home page content including banner, hero title, and
              description.
            </p>
          </div>

          <HomeForm initialData={homeData} onSave={handleSave} />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
}
