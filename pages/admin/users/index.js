import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
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
  Search,
  User,
  Mail,
  Shield,
  Calendar,
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { toast } = useToast();
  const latestRequest = useRef(0);

  const fetchUsers = useCallback(async (page) => {
    const request = ++latestRequest.current;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: "10", search: searchQuery });
      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();
      if (request !== latestRequest.current) return;
      if (response.ok && data.success) {
        setUsers(data.data);
        setPagination({
          current: data.pagination.current,
          pages: data.pagination.pages,
          total: data.total,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      if (request === latestRequest.current) setIsLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the current page after deletion
        fetchUsers(pagination.current);
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading && users.length === 0 && !searchQuery) {
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
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">
              Total users: {pagination.total}
            </p>
          </div>
          <Link href="/admin/users/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </Link>
        </div>

        <label className="block text-sm font-medium text-gray-700">Search users
          <Input type="search" value={searchQuery} onChange={handleSearch} placeholder="Name or email" className="mt-2 text-black" />
        </label>
        {isLoading && <p role="status" className="text-sm text-gray-500">Loading users…</p>}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>

                <TableHead>Role</TableHead>

                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && users.length === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-gray-500">No users found.</TableCell></TableRow>}
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-black">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        Email: {user.email}
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="capitalize text-black">{user.role}</span>
                    </div>
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
                        <Link href={`/admin/users/${user._id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4 text-black" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user._id)}
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-black"
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={isLoading || pagination.current === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-black"
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={isLoading || pagination.current >= pagination.pages}
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
