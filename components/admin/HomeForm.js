"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function HomeForm({ initialData, onSave }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    banner: {
      type: "image",
      url: "",
    },
    heroTitle: "",
    heroDescription: "",
    aboutSectionImage: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        banner: initialData.banner || { type: "image", url: "" },
        heroTitle: initialData.heroTitle || "",
        heroDescription: initialData.heroDescription || "",
        aboutSectionImage: initialData.aboutSectionImage || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = initialData ? "PUT" : "POST";
      const response = await fetch("/api/home", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Home content saved successfully",
        });
        if (onSave) onSave(data);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save content",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      {/* Banner Section */}
      <div className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold">Banner</h2>

        <div className="space-y-2">
          <Label htmlFor="bannerType">Banner Type</Label>
          <Select
            value={formData.banner.type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                banner: { ...formData.banner, type: value, url: "" },
              })
            }
          >
            <SelectTrigger id="bannerType">
              <SelectValue placeholder="Select banner type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            {formData.banner.type === "image" ? "Banner Image" : "Banner Video"}
          </Label>
          {formData.banner.type === "image" ? (
            <ImageUpload
              value={formData.banner.url}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  banner: { ...formData.banner, url: value },
                })
              }
              onRemove={() =>
                setFormData({
                  ...formData,
                  banner: { ...formData.banner, url: "" },
                })
              }
            />
          ) : (
            <VideoUpload
              value={formData.banner.url}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  banner: { ...formData.banner, url: value },
                })
              }
              onRemove={() =>
                setFormData({
                  ...formData,
                  banner: { ...formData.banner, url: "" },
                })
              }
            />
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold">Hero Section</h2>

        <div className="space-y-2">
          <Label htmlFor="heroTitle">Hero Title</Label>
          <Input
            id="heroTitle"
            value={formData.heroTitle}
            onChange={(e) =>
              setFormData({ ...formData, heroTitle: e.target.value })
            }
            placeholder="Enter hero title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heroDescription">Hero Description</Label>
          <Textarea
            id="heroDescription"
            value={formData.heroDescription}
            onChange={(e) =>
              setFormData({ ...formData, heroDescription: e.target.value })
            }
            placeholder="Enter hero description"
            rows={4}
          />
        </div>
      </div>

      {/* Home About Section Image */}
      <div className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold">Home About Section Image</h2>
        <p className="text-sm text-muted-foreground">
          The image shown in the &quot;Welcome to Lonuhiri&quot; section on the
          home page.
        </p>

        <div className="space-y-2">
          <Label>About Section Image</Label>
          <ImageUpload
            value={formData.aboutSectionImage}
            onChange={(value) =>
              setFormData({ ...formData, aboutSectionImage: value })
            }
            onRemove={() => setFormData({ ...formData, aboutSectionImage: "" })}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
