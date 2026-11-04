import { useState, useEffect } from "react";
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
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AdminLayout from "@/components/Layout/AdminLayout";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages(1);
  }, []);

  const fetchPackages = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/packages?page=${page}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
        setPagination({
          current: data.pagination.current,
          pages: data.pagination.pages,
          total: data.total,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch packages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPackages(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        fetchPackages(pagination.current);
        toast({
          title: "Success",
          description: "Package deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete package",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
            <p className="text-sm text-gray-500">
              Total packages: {pagination.total}
            </p>
          </div>
          <Link href="/admin/packages/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg._id}>
                  <TableCell className="font-medium text-black">
                    {pkg.title}
                  </TableCell>
                  <TableCell className="text-black">${pkg.price}/person</TableCell>
                  <TableCell className="text-black">{pkg.duration || "N/A"}</TableCell>
                  <TableCell>
                    {pkg.featured ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        pkg.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 text-black"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/packages/${pkg._id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4 text-black" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(pkg._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing {packages.length > 0 ? (pagination.current - 1) * 10 + 1 : 0} to{" "}
                {Math.min(pagination.current * 10, pagination.total)} of{" "}
                {pagination.total} packages
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
        </div>
      </div>
    </AdminLayout>
  );
}

