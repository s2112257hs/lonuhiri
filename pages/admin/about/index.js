"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Layout/AdminLayout";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

const ICON_OPTIONS = [
  "Heart",
  "Award",
  "Users",
  "Globe",
  "Star",
  "Shield",
  "Leaf",
  "Zap",
  "Smile",
  "Sun",
];

export default function AdminAboutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    heroTitle: "",
    heroDescription: "",
    heroImage: "",
    storyTitle: "",
    storyContent: "",
    storyImage: "",
    valuesTitle: "",
    valuesDescription: "",
    values: [],
    ctaTitle: "",
    ctaDescription: "",
    ctaButtonText: "",
    ctaButtonLink: "",
  });
  const [newValue, setNewValue] = useState({
    icon: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchAboutData();
  }, [session, status, router]);

  const fetchAboutData = async () => {
    try {
      const response = await fetch("/api/about");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormData({
            heroTitle: data.data.heroTitle || "",
            heroDescription: data.data.heroDescription || "",
            heroImage: data.data.heroImage || "",
            storyTitle: data.data.storyTitle || "",
            storyContent: data.data.storyContent || "",
            storyImage: data.data.storyImage || "",
            valuesTitle: data.data.valuesTitle || "",
            valuesDescription: data.data.valuesDescription || "",
            values: data.data.values || [],
            ctaTitle: data.data.ctaTitle || "",
            ctaDescription: data.data.ctaDescription || "",
            ctaButtonText: data.data.ctaButtonText || "",
            ctaButtonLink: data.data.ctaButtonLink || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/about", {
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
          description: "About page content updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update about page",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating about data:", error);
      toast({
        title: "Error",
        description: "Failed to update about page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addValue = () => {
    if (newValue.title && newValue.icon) {
      setFormData((prev) => ({
        ...prev,
        values: [...prev.values, { ...newValue }],
      }));
      setNewValue({ icon: "", title: "", description: "" });
    }
  };

  const removeValue = (index) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  if (status === "loading" || isFetching) {
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              About Page Content
            </h1>
            <p className="text-sm text-gray-500">
              Manage the content for the About Us page
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-8 text-black">
            {/* Hero Section */}
            <div className="space-y-4 border-b pb-6">
              <h2 className="text-xl font-semibold">Hero Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="heroDescription">Hero Description</Label>
                  <Textarea
                    id="heroDescription"
                    name="heroDescription"
                    value={formData.heroDescription}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Hero Image</Label>
                  <ImageUpload
                    value={formData.heroImage}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, heroImage: value }))
                    }
                    onRemove={() =>
                      setFormData((prev) => ({ ...prev, heroImage: "" }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Story Section */}
            <div className="space-y-4 border-b pb-6">
              <h2 className="text-xl font-semibold">Our Story Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="storyTitle">Story Title</Label>
                  <Input
                    id="storyTitle"
                    name="storyTitle"
                    value={formData.storyTitle}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="storyContent">Story Content</Label>
                  <Textarea
                    id="storyContent"
                    name="storyContent"
                    value={formData.storyContent}
                    onChange={handleChange}
                    rows={6}
                    className="mt-1 text-black"
                    placeholder="Use line breaks to separate paragraphs"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Story Image</Label>
                  <ImageUpload
                    value={formData.storyImage}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, storyImage: value }))
                    }
                    onRemove={() =>
                      setFormData((prev) => ({ ...prev, storyImage: "" }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="space-y-4 border-b pb-6">
              <h2 className="text-xl font-semibold">Our Values Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="valuesTitle">Values Title</Label>
                  <Input
                    id="valuesTitle"
                    name="valuesTitle"
                    value={formData.valuesTitle}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="valuesDescription">Values Description</Label>
                  <Input
                    id="valuesDescription"
                    name="valuesDescription"
                    value={formData.valuesDescription}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Values</Label>
                {formData.values.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Icon</Label>
                        <Input
                          value={value.icon}
                          disabled
                          className="mt-1 text-black"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={value.title}
                          disabled
                          className="mt-1 text-black"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={value.description}
                          disabled
                          className="mt-1 text-black"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeValue(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Add New Value</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="newValueIcon">Icon</Label>
                      <select
                        id="newValueIcon"
                        value={newValue.icon}
                        onChange={(e) =>
                          setNewValue((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-md mt-1 text-black"
                      >
                        <option value="">Select Icon</option>
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="newValueTitle">Title</Label>
                      <Input
                        id="newValueTitle"
                        value={newValue.title}
                        onChange={(e) =>
                          setNewValue((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="mt-1 text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newValueDescription">Description</Label>
                      <Input
                        id="newValueDescription"
                        value={newValue.description}
                        onChange={(e) =>
                          setNewValue((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1 text-black"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addValue}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Call to Action Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ctaTitle">CTA Title</Label>
                  <Input
                    id="ctaTitle"
                    name="ctaTitle"
                    value={formData.ctaTitle}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaDescription">CTA Description</Label>
                  <Input
                    id="ctaDescription"
                    name="ctaDescription"
                    value={formData.ctaDescription}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaButtonText">Button Text</Label>
                  <Input
                    id="ctaButtonText"
                    name="ctaButtonText"
                    value={formData.ctaButtonText}
                    onChange={handleChange}
                    className="mt-1 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaButtonLink">Button Link</Label>
                  <Input
                    id="ctaButtonLink"
                    name="ctaButtonLink"
                    value={formData.ctaButtonLink}
                    onChange={handleChange}
                    className="mt-1 text-black"
                    placeholder="/contact or #"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link href="/admin">
                <Button type="button" variant="outline" className="text-black">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
