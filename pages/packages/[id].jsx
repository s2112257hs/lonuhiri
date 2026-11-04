"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, Users } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function PackageDetail({ pkg: initialPkg }) {
  const [pkg] = useState(initialPkg);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    bookingDate: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const { toast } = useToast();

  if (!pkg) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Package not found</h1>
          <p className="text-muted-foreground">
            The package you are looking for does not exist.
          </p>
        </div>
      </MainLayout>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfGuests" ? parseInt(value) || 1 : value,
    }));
  };

  const calculateTotalPrice = () => {
    const basePrice = pkg.price * formData.numberOfGuests;
    const serviceCharge = 50;
    return basePrice + serviceCharge;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalPrice = calculateTotalPrice();
      const response = await axios.post("/api/bookings", {
        bookingType: "package",
        package: pkg._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        bookingDate: formData.bookingDate,
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
          bookingDate: "",
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
      <div className="h-[80vh] md:h-[80vh] relative">
        <img
          src={pkg.image || "/placeholder.svg"}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-7xl">
            {pkg.featured && (
              <span className="inline-block bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
                Most Popular
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-background mb-4 text-balance">
              {pkg.title}
            </h1>
            <p className="text-xl text-background/90 max-w-2xl text-pretty">
              {pkg.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">{pkg.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Up to {pkg.maxGuests} guests
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
                About This Package
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {pkg.longDescription}
              </p>
            </div>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                  What&apos;s Included
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Itinerary
                </h2>
                <div className="space-y-6">
                  {pkg.itinerary.map((day, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary pl-6 pb-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-black">
                            {day.day}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {day.title}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <li
                            key={actIndex}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {activity}
                            </span>
                          </li>
                        ))}
                      </ul>
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
                <div className="text-3xl font-bold text-primary mb-2">
                  ${pkg.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /person
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete package pricing
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-black">
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
                  <Label htmlFor="bookingDate">Start Date</Label>
                  <Input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    required
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfGuests">Number of Guests</Label>
                  <select
                    id="numberOfGuests"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-border bg-background mt-1"
                  >
                    {[...Array(pkg.maxGuests)].map((_, i) => (
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
                      Package price ({formData.numberOfGuests} guest
                      {formData.numberOfGuests > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">
                      ${pkg.price * formData.numberOfGuests}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Service charge
                    </span>
                    <span className="font-medium">$50</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">
                      ${calculateTotalPrice()}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Book This Package"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Flexible cancellation up to 48 hours before
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-black">
                <h3 className="font-semibold mb-3">Have questions?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our team is here to help customize your perfect package.
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
    const response = await axios.get(`${baseURL}/api/packages/${id}`);

    if (response.data.success) {
      return {
        props: {
          pkg: JSON.parse(JSON.stringify(response.data.data)),
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error("Error fetching package:", error);
    return {
      notFound: true,
    };
  }
}
