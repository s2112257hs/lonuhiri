"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Layout/AdminLayout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";

export default function EditReelPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: "",
    video: "",
    order: 0,
    featured: false,
    popular: false,
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      fetchReel();
    }
  }, [id]);

  const fetchReel = async () => {
    try {
      const response = await fetch(`/api/reels/${id}`);
      const data = await response.json();

      if (data.success) {
        setFormData(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reel",
          variant: "destructive",
        });
        router.push("/admin/reels");
      }
    } catch (error) {
      console.error("Error fetching reel:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reel",
        variant: "destructive",
      });
      router.push("/admin/reels");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Reel updated successfully",
        });
        router.push("/admin/reels");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update reel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating reel:", error);
      toast({
        title: "Error",
        description: "Failed to update reel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/reels">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Reel</h1>
            <p className="text-sm text-gray-500">Update reel information</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl text-black"
          >
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label>Thumbnail *</Label>
              <ImageUpload
                value={formData.thumbnail}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, thumbnail: value }))
                }
                onRemove={() =>
                  setFormData((prev) => ({ ...prev, thumbnail: "" }))
                }
              />
            </div>

            <div>
              <Label>Video</Label>
              <VideoUpload
                value={formData.video}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, video: value }))
                }
                onRemove={() => setFormData((prev) => ({ ...prev, video: "" }))}
              />
            </div>

            <div>
              <Label htmlFor="order">Order Number</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1 text-black"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
              <Label htmlFor="featured">Featured</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="popular"
                checked={formData.popular}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, popular: checked }))
                }
              />
              <Label htmlFor="popular">Popular</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/reels">
                <Button type="button" variant="outline" className="text-black">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Reel"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
