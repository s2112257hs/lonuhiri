"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Layout/AdminLayout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    rating: 5,
    review: "",
    date: "",
    order: 0,
    featured: false,
    popular: false,
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rating: parseInt(formData.rating),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Review created successfully",
        });
        router.push("/admin/reviews");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating review:", error);
      toast({
        title: "Error",
        description: "Failed to create review",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/reviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Review</h1>
            <p className="text-sm text-gray-500">Create a new review</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl text-black"
          >
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, avatar: e.target.value }))
                }
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label htmlFor="rating">Rating * (1-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: e.target.value,
                  }))
                }
                required
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label htmlFor="review">Review *</Label>
              <Textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, review: e.target.value }))
                }
                required
                rows={5}
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                placeholder="e.g., 2 weeks ago"
                className="mt-1 text-black"
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
              <Link href="/admin/reviews">
                <Button type="button" variant="outline" className="text-black">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
