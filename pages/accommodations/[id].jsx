"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Bed, Wifi, Tv, Coffee, Wind } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AccommodationDetail({
  accommodation: initialAccommodation,
}) {
  const [accommodation] = useState(initialAccommodation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const { toast } = useToast();

  if (!accommodation) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Accommodation not found</h1>
          <p className="text-muted-foreground">
            The accommodation you are looking for does not exist.
          </p>
        </div>
      </MainLayout>
    );
  }

  // Combine main image with additional images
  const allImages = accommodation.image
    ? [accommodation.image, ...(accommodation.images || [])]
    : accommodation.images || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfGuests" ? parseInt(value) || 1 : value,
    }));
  };

  const calculateTotalPrice = () => {
    if (!formData.checkIn || !formData.checkOut) return accommodation.price;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * accommodation.price : accommodation.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalPrice = calculateTotalPrice();
      const response = await axios.post("/api/bookings", {
        bookingType: "accommodation",
        accommodation: accommodation._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        numberOfGuests: formData.numberOfGuests,
        totalPrice,
        specialRequests: formData.specialRequests,
      });

      if (response.data.success) {
        toast({
          title: "Booking Submitted",
          description:
            "Your booking request has been submitted successfully. We'll contact you soon!",
        });
        // Reset form
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          checkIn: "",
          checkOut: "",
          numberOfGuests: 1,
          specialRequests: "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Toaster />
      {/* Hero Image */}
      <div className="h-[50vh] md:h-[60vh] relative">
        <img
          src={allImages[0] || "/placeholder.svg"}
          alt={accommodation.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold text-background mb-4 text-balance">
              {accommodation.title}
            </h1>
            <p className="text-xl text-background/90 max-w-2xl text-pretty">
              {accommodation.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16 text-black">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Up to {accommodation.guests} guests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  {accommodation.beds} bed{accommodation.beds > 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Size: {accommodation.size}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                About This Accommodation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {accommodation.longDescription}
              </p>
            </div>

            {/* Amenities */}
            {accommodation.amenities && accommodation.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Amenities
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {accommodation.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">
                        {amenity.name || amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                What&apos;s Included
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {accommodation.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Images */}
            {allImages.length > 1 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                  Gallery
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allImages.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${accommodation.title} view ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-6 shadow-lg">
              <div className="mb-6">
                <div className="text-3xl font-bold text-secondary mb-2">
                  ${accommodation.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /night
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Best rate guaranteed
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="checkIn">Check-in</Label>
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out</Label>
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={
                      formData.checkIn || new Date().toISOString().split("T")[0]
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfGuests">Guests</Label>
                  <select
                    id="numberOfGuests"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-border bg-background mt-1"
                  >
                    {[...Array(accommodation.guests)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} Guest{i > 0 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Price per night
                    </span>
                    <span className="font-medium">${accommodation.price}</span>
                  </div>
                  {formData.checkIn && formData.checkOut && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Nights
                      </span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(formData.checkOut) -
                            new Date(formData.checkIn)) /
                            (1000 * 60 * 60 * 24),
                        ) || 0}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-secondary">
                      ${calculateTotalPrice()}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary text-secondary-foreground"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Book Now"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won&apos;t be charged yet
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">Need help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contact our reservations team for special requests or
                  questions.
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`;

  try {
    const response = await axios.get(`${baseURL}/api/accommodations/${id}`);

    if (response.data.success) {
      return {
        props: {
          accommodation: JSON.parse(JSON.stringify(response.data.data)),
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error("Error fetching accommodation:", error);
    return {
      notFound: true,
    };
  }
}
