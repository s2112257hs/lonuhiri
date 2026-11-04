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
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NewAccommodationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    images: [],
    price: "",
    guests: 2,
    beds: 1,
    size: "",
    amenities: [],
    features: [],
    order: 0,
    featured: false,
    popular: false,
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState({ name: "", icon: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        guests: parseInt(formData.guests),
        beds: parseInt(formData.beds),
        order: parseInt(formData.order) || 0,
      };

      const response = await fetch("/api/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Accommodation created successfully",
        });
        router.push("/admin/accommodations");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create accommodation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating accommodation:", error);
      toast({
        title: "Error",
        description: "Failed to create accommodation",
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

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addAmenity = () => {
    if (newAmenity.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, { ...newAmenity }],
      }));
      setNewAmenity({ name: "", icon: "" });
    }
  };

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/accommodations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              New Accommodation
            </h1>
            <p className="text-sm text-gray-500">
              Create a new accommodation listing
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6 text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 text-black"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Main Image *</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, image: value }))
                  }
                  onRemove={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="price">Price per Night *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="mt-1 text-black"
                />
              </div>

              <div>
                <Label htmlFor="guests">Max Guests *</Label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  className="mt-1 text-black"
                />
              </div>

              <div>
                <Label htmlFor="beds">Number of Beds *</Label>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  value={formData.beds}
                  onChange={handleChange}
                  required
                  className="mt-1 text-black"
                />
              </div>

              <div>
                <Label htmlFor="size">Size (e.g., 35 sqm)</Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
            </div>

            <div>
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                rows={5}
                className="mt-1 text-black"
              />
            </div>

            <div>
              <Label>Additional Images</Label>
              <div className="mt-2 space-y-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <ImageUpload
                      value={img || ""}
                      onChange={(value) => {
                        const newImages = [...formData.images];
                        newImages[index] = value;
                        setFormData((prev) => ({ ...prev, images: newImages }));
                      }}
                      onRemove={() => removeImage(index)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      images: [...prev.images, ""],
                    }));
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Image
                </Button>
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={feature} readOnly className="text-black" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Feature description"
                    className="text-black"
                  />
                  <Button type="button" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="mt-2 space-y-2">
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={`${amenity.name} (${amenity.icon})`}
                      readOnly
                      className="text-black"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAmenity(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newAmenity.name}
                    onChange={(e) =>
                      setNewAmenity((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Amenity name"
                    className="text-black"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity.icon}
                      onChange={(e) =>
                        setNewAmenity((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }))
                      }
                      placeholder="Icon name"
                      className="text-black"
                    />
                    <Button type="button" onClick={addAmenity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/accommodations">
                <Button type="button" variant="outline" className="text-black">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Accommodation"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
