"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ExcursionDetail({ excursion: initialExcursion }) {
  const [excursion] = useState(initialExcursion);
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

  if (!excursion) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Excursion not found</h1>
          <p className="text-muted-foreground">
            The excursion you are looking for does not exist.
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
    return excursion.price * formData.numberOfGuests;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalPrice = calculateTotalPrice();
      const response = await axios.post("/api/bookings", {
        bookingType: "excursion",
        excursion: excursion._id,
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
      <div className="h-[50vh] md:h-[60vh] relative">
        <img
          src={excursion.image || "/placeholder.svg"}
          alt={excursion.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {excursion.difficulty}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-background mb-4 text-balance">
              {excursion.title}
            </h1>
            <p className="text-xl text-background/90 max-w-2xl text-pretty">
              {excursion.description}
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
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">
                  {excursion.duration}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">
                  {excursion.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">
                  Max {excursion.maxGuests} guests
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
                About This Excursion
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {excursion.longDescription}
              </p>
            </div>

            {/* Highlights */}
            {excursion.highlights && excursion.highlights.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black ">
                  Highlights
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {excursion.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included */}
            {excursion.includes && excursion.includes.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                  What&apos;s Included
                </h2>
                <ul className="space-y-2">
                  {excursion.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Schedule */}
            {excursion.schedule && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                  Schedule
                </h2>
                <div className="bg-muted/30 rounded-lg p-6 space-y-3">
                  {excursion.schedule.departure && (
                    <div className="flex justify-between">
                      <span className="font-medium">Departure Time:</span>
                      <span className="text-muted-foreground">
                        {excursion.schedule.departure}
                      </span>
                    </div>
                  )}
                  {excursion.schedule.return && (
                    <div className="flex justify-between">
                      <span className="font-medium">Return Time:</span>
                      <span className="text-muted-foreground">
                        {excursion.schedule.return}
                      </span>
                    </div>
                  )}
                  {excursion.schedule.availability && (
                    <div className="flex justify-between">
                      <span className="font-medium">Availability:</span>
                      <span className="text-muted-foreground">
                        {excursion.schedule.availability}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What to Bring */}
            {excursion.whatToBring && excursion.whatToBring.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                  What to Bring
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {excursion.whatToBring.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">→</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h3 className="font-bold mb-3 text-black">
                Important Information
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Minimum age requirement may apply</li>
                <li>• Activity may be cancelled due to weather conditions</li>
                <li>
                  • Full refund available for cancellations 24 hours in advance
                </li>
                <li>• Please arrive 15 minutes before departure time</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-6 shadow-lg text-black">
              <div className="mb-6">
                <div className="text-3xl font-bold text-secondary mb-2">
                  ${excursion.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /person
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Per person pricing
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
                  <Label htmlFor="bookingDate">Select Date</Label>
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
                    {[...Array(Math.min(excursion.maxGuests, 8))].map(
                      (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} Guest{i > 0 ? "s" : ""}
                        </option>
                      ),
                    )}
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
                      Price per person
                    </span>
                    <span className="font-medium">${excursion.price}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">
                      Total ({formData.numberOfGuests} guest
                      {formData.numberOfGuests > 1 ? "s" : ""})
                    </span>
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
                  {isSubmitting ? "Submitting..." : "Book This Excursion"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24 hours before
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-border space-y-3 text-black">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>Small group sizes</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border text-black">
                <h3 className="font-semibold mb-3">Need assistance?</h3>
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
    const response = await axios.get(`${baseURL}/api/excursions/${id}`);

    if (response.data.success) {
      return {
        props: {
          excursion: JSON.parse(JSON.stringify(response.data.data)),
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error("Error fetching excursion:", error);
    return {
      notFound: true,
    };
  }
}
