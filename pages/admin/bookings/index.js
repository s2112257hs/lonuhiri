"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    bookingType: "",
    status: "",
    search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchBookings = useCallback(
    async (page, currentFilters) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        if (currentFilters?.bookingType) {
          params.append("bookingType", currentFilters.bookingType);
        }
        if (currentFilters?.status) {
          params.append("status", currentFilters.status);
        }
        if (currentFilters?.search) {
          params.append("search", currentFilters.search);
        }

        const response = await fetch(`/api/bookings?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
          setPagination({
            current: data.pagination.current,
            pages: data.pagination.pages,
            total: data.total,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch bookings",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchBookings(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchBookings(newPage, filters);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchBookings(1, filters);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        fetchBookings(pagination.current, filters);
        toast({
          title: "Success",
          description: "Booking status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update booking status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "default",
      confirmed: "default",
      cancelled: "destructive",
      completed: "default",
    };
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      confirmed: "bg-green-500/10 text-green-700 dark:text-green-400",
      cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
      completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    };
    return (
      <Badge className={colors[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBookingTitle = (booking) => {
    if (booking.accommodation) {
      return booking.accommodation.title || "N/A";
    }
    if (booking.package) {
      return booking.package.title || "N/A";
    }
    if (booking.excursion) {
      return booking.excursion.title || "N/A";
    }
    return "N/A";
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const handleDialogStatusUpdate = async (newStatus) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        // Update the selected booking in state
        setSelectedBooking({ ...selectedBooking, status: newStatus });
        // Refresh the bookings list
        fetchBookings(pagination.current, filters);
        toast({
          title: "Success",
          description: "Booking status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update booking status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">
              Manage all bookings and reservations
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 text-black"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium mb-2 block">
              Booking Type
            </label>
            <Select
              value={filters.bookingType || "all"}
              onValueChange={(value) =>
                handleFilterChange("bookingType", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="excursion">Excursion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                handleFilterChange("status", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No bookings found
          </div>
        ) : (
          <>
            <div className="border rounded-lg text-black">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.customerEmail}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {booking.bookingType.charAt(0).toUpperCase() +
                            booking.bookingType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getBookingTitle(booking)}</TableCell>
                      <TableCell>
                        {booking.bookingType === "accommodation" ? (
                          <div className="text-sm">
                            <div>Check-in: {formatDate(booking.checkIn)}</div>
                            <div>Check-out: {formatDate(booking.checkOut)}</div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            Date: {formatDate(booking.bookingDate)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{booking.numberOfGuests}</TableCell>
                      <TableCell>${booking.totalPrice}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{formatDate(booking.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(booking._id, "confirmed")
                              }
                              disabled={booking.status === "confirmed"}
                            >
                              Mark as Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(booking._id, "cancelled")
                              }
                              disabled={booking.status === "cancelled"}
                            >
                              Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(booking._id, "completed")
                              }
                              disabled={booking.status === "completed"}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      {bookings.length > 0
                        ? (pagination.current - 1) * 20 + 1
                        : 0}{" "}
                      to {Math.min(pagination.current * 20, pagination.total)}{" "}
                      of {pagination.total} bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Page {pagination.current} of {pagination.pages}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-black"
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    {/* Page Numbers */}
                    {pagination.pages <= 7 ? (
                      // Show all page numbers if 7 or fewer pages
                      Array.from(
                        { length: pagination.pages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={
                            page === pagination.current ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            page === pagination.current
                              ? "bg-primary text-primary-foreground"
                              : "text-black"
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))
                    ) : (
                      // Show first, last, current, and nearby pages
                      <>
                        <Button
                          variant={
                            1 === pagination.current ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            1 === pagination.current
                              ? "bg-primary text-primary-foreground"
                              : "text-black"
                          }
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                        {pagination.current > 3 && (
                          <span className="text-gray-500">...</span>
                        )}
                        {pagination.current > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-black"
                            onClick={() =>
                              handlePageChange(pagination.current - 1)
                            }
                          >
                            {pagination.current - 1}
                          </Button>
                        )}
                        {pagination.current !== 1 &&
                          pagination.current !== pagination.pages && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary text-primary-foreground"
                              disabled
                              aria-current="page"
                            >
                              {pagination.current}
                            </Button>
                          )}
                        {pagination.current < pagination.pages - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-black"
                            onClick={() =>
                              handlePageChange(pagination.current + 1)
                            }
                          >
                            {pagination.current + 1}
                          </Button>
                        )}
                        {pagination.current < pagination.pages - 2 && (
                          <span className="text-gray-500">...</span>
                        )}
                        <Button
                          variant={
                            pagination.pages === pagination.current
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            pagination.pages === pagination.current
                              ? "bg-primary text-primary-foreground"
                              : "text-black"
                          }
                          onClick={() => handlePageChange(pagination.pages)}
                        >
                          {pagination.pages}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-black"
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Booking Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-black">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                View and manage booking information
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6 mt-4">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Name
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.customerName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Email
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.customerEmail}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Phone
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.customerPhone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Number of Guests
                      </Label>
                      <p className="font-medium">
                        {selectedBooking.numberOfGuests}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Booking Type
                      </Label>
                      <p className="font-medium">
                        <Badge variant="outline">
                          {selectedBooking.bookingType.charAt(0).toUpperCase() +
                            selectedBooking.bookingType.slice(1)}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Item
                      </Label>
                      <p className="font-medium">
                        {getBookingTitle(selectedBooking)}
                      </p>
                    </div>
                    {selectedBooking.bookingType === "accommodation" ? (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Check-in
                          </Label>
                          <p className="font-medium">
                            {formatDate(selectedBooking.checkIn)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Check-out
                          </Label>
                          <p className="font-medium">
                            {formatDate(selectedBooking.checkOut)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Booking Date
                        </Label>
                        <p className="font-medium">
                          {formatDate(selectedBooking.bookingDate)}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Total Price
                      </Label>
                      <p className="font-medium text-lg">
                        ${selectedBooking.totalPrice}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Status
                      </Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Created At
                      </Label>
                      <p className="font-medium">
                        {formatDate(selectedBooking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Special Requests
                    </Label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={
                        selectedBooking.status === "pending"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleDialogStatusUpdate("pending")}
                      disabled={selectedBooking.status === "pending"}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={
                        selectedBooking.status === "confirmed"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleDialogStatusUpdate("confirmed")}
                      disabled={selectedBooking.status === "confirmed"}
                    >
                      Confirmed
                    </Button>
                    <Button
                      variant={
                        selectedBooking.status === "cancelled"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleDialogStatusUpdate("cancelled")}
                      disabled={selectedBooking.status === "cancelled"}
                    >
                      Cancelled
                    </Button>
                    <Button
                      variant={
                        selectedBooking.status === "completed"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleDialogStatusUpdate("completed")}
                      disabled={selectedBooking.status === "completed"}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
