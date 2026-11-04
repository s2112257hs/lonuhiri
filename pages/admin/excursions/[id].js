"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Layout/AdminLayout";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";

export default function EditExcursionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    duration: "",
    location: "",
    price: "",
    maxGuests: 10,
    difficulty: "Easy",
    highlights: [],
    includes: [],
    schedule: { departure: "", return: "", availability: "" },
    whatToBring: [],
    order: 0,
    featured: false,
    popular: false,
    isActive: true,
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [newInclude, setNewInclude] = useState("");
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (id) {
      fetchExcursion();
    }
  }, [id]);

  const fetchExcursion = async () => {
    try {
      const response = await fetch(`/api/excursions/${id}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          ...data.data,
          price: data.data.price.toString(),
          maxGuests: data.data.maxGuests.toString(),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch excursion",
          variant: "destructive",
        });
        router.push("/admin/excursions");
      }
    } catch (error) {
      console.error("Error fetching excursion:", error);
      toast({
        title: "Error",
        description: "Failed to fetch excursion",
        variant: "destructive",
      });
      router.push("/admin/excursions");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        maxGuests: parseInt(formData.maxGuests),
        order: parseInt(formData.order) || 0,
      };

      const response = await fetch(`/api/excursions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Excursion updated successfully",
        });
        router.push("/admin/excursions");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update excursion",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating excursion:", error);
      toast({
        title: "Error",
        description: "Failed to update excursion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
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
          <Link href="/admin/excursions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Excursion</h1>
            <p className="text-sm text-gray-500">
              Update excursion information
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="mt-1 text-black"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Image *</Label>
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
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxGuests: e.target.value,
                    }))
                  }
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger className="mt-1 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longDescription: e.target.value,
                  }))
                }
                rows={5}
                className="mt-1 text-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Departure Time</Label>
                <Input
                  value={formData.schedule.departure}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        departure: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label>Return Time</Label>
                <Input
                  value={formData.schedule.return}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        return: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 text-black"
                />
              </div>
              <div>
                <Label>Availability</Label>
                <Input
                  value={formData.schedule.availability}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        availability: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 text-black"
                />
              </div>
            </div>

            <div>
              <Label>Highlights</Label>
              <div className="mt-2 space-y-2">
                {formData.highlights.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="text-black" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("highlights", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Highlight"
                    className="text-black"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addArrayItem("highlights", newHighlight, setNewHighlight)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>What&apos;s Included</Label>
              <div className="mt-2 space-y-2">
                {formData.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="text-black" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("includes", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    placeholder="Included item"
                    className="text-black"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addArrayItem("includes", newInclude, setNewInclude)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>What to Bring</Label>
              <div className="mt-2 space-y-2">
                {formData.whatToBring.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={item} readOnly className="text-black" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("whatToBring", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Item to bring"
                    className="text-black"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addArrayItem("whatToBring", newItem, setNewItem)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/excursions">
                <Button type="button" variant="outline" className="text-black">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Excursion"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
