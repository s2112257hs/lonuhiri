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

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReels(1);
  }, []);

  const fetchReels = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reels?page=${page}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setReels(data.data);
        setPagination({
          current: data.pagination.current,
          pages: data.pagination.pages,
          total: data.total,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reels",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchReels(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;

    try {
      const response = await fetch(`/api/reels/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        fetchReels(pagination.current);
        toast({
          title: "Success",
          description: "Reel deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete reel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting reel:", error);
      toast({
        title: "Error",
        description: "Failed to delete reel",
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
            <h1 className="text-2xl font-bold text-gray-900">Reels</h1>
            <p className="text-sm text-gray-500">
              Total reels: {pagination.total}
            </p>
          </div>
          <Link href="/admin/reels/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Reel
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reels.map((reel) => (
                <TableRow key={reel._id}>
                  <TableCell className="font-medium text-black">
                    {reel.title}
                  </TableCell>
                  <TableCell className="text-black">
                    {reel.thumbnail ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-black">
                    {reel.video ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        reel.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {reel.isActive ? "Active" : "Inactive"}
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
                        <Link href={`/admin/reels/${reel._id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4 text-black" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(reel._id)}
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
                Showing {reels.length > 0 ? (pagination.current - 1) * 10 + 1 : 0} to{" "}
                {Math.min(pagination.current * 10, pagination.total)} of{" "}
                {pagination.total} reels
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

