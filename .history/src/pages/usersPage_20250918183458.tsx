import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  UserPlus,
  X,
  Download,
  ChevronUp,
  Loader,
  Shield,
  Mail,
  User,
  Calendar,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import useToast from "../hooks/useToast";
import { StatusButton } from "../components/ui/status-button";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import * as XLSX from "xlsx";

// User type based on the Django model
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "instructor" | "admin";
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  permissions?: string[];
};

// Dummy data for users
const dummyUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    role: "admin",
    is_active: true,
    is_staff: true,
    date_joined: "2023-01-15T10:30:00Z",
    permissions: ["add_user", "change_user", "delete_user", "view_user"],
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    role: "instructor",
    is_active: true,
    is_staff: true,
    date_joined: "2023-02-20T14:45:00Z",
    permissions: ["view_user", "change_user"],
  },
  {
    id: "3",
    email: "robert.johnson@example.com",
    first_name: "Robert",
    last_name: "Johnson",
    role: "student",
    is_active: true,
    is_staff: false,
    date_joined: "2023-03-10T09:15:00Z",
    permissions: ["view_user"],
  },
  {
    id: "4",
    email: "sarah.wilson@example.com",
    first_name: "Sarah",
    last_name: "Wilson",
    role: "student",
    is_active: false,
    is_staff: false,
    date_joined: "2023-04-05T16:20:00Z",
    permissions: [],
  },
  {
    id: "5",
    email: "michael.brown@example.com",
    first_name: "Michael",
    last_name: "Brown",
    role: "instructor",
    is_active: true,
    is_staff: false,
    date_joined: "2023-05-12T11:30:00Z",
    permissions: ["view_user", "change_user"],
  },
];

// Available permissions
const availablePermissions = [
  "add_user",
  "change_user",
  "delete_user",
  "view_user",
  "add_course",
  "change_course",
  "delete_course",
  "view_course",
];

// Helper component for sortable headers
const SortableHeader = ({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

export function UsersPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const { setToastMessage } = useToast();
  const [data, setData] = React.useState<User[]>([]);
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "student" as "student" | "instructor" | "admin",
    is_active: true,
    is_staff: false,
    permissions: [] as string[],
  });

  // Get users data
  const getUsers = async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get("/api/users");
      if (resp.data.success) {
        setData(
          resp.data.data.map((d: any) => {
            return { ...d, permissions: d.current_permissions };
          })
        );
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "student" | "instructor" | "admin",
    }));
  };

  // Handle permission toggle
  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      role: "student",
      is_active: true,
      is_staff: false,
      permissions: [],
    });
    setEditingUser(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (editingUser) {
        const resp = await axios.put(
          `/api/users/${editingUser.id}`,
          editingUser
        );
        if (resp.data.success) {
          setData((prev) =>
            prev.map((user) =>
              user.id === editingUser.id
                ? { ...user, ...formData, id: editingUser.id }
                : user
            )
          );
          setToastMessage({
            message: "User updated successfully",
            variant: "success",
          });
          setIsDialogOpen(false);
          resetForm();
        }
      } else {
           const newUser: User = {
            ...formData,
            id: String(Date.now()),
            date_joined: new Date().toISOString(),
          };
        const resp = await axios.post(`/api/users/`, newUser);
        if (resp.data.success) {
       
          setData((prev) => [...prev, newUser]);
          setToastMessage({
            message: "User created successfully",
            variant: "success",
          });
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      setToastMessage({ variant: "danger", message: "Something went" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      is_staff: user.is_staff,
      permissions: user?.permissions || [],
    });
    setIsDialogOpen(true);
  };

  // Handle delete user
  const handleDelete = (id: string) => {
    // Simulate API call
    setData((prev) => prev.filter((user) => user.id !== id));
    setToastMessage({
      message: "User deleted successfully",
      variant: "success",
    });
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortableHeader column={column}>Email</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          <span>{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <SortableHeader column={column}>First Name</SortableHeader>
      ),
      cell: ({ row }) => <div>{row.getValue("first_name")}</div>,
    },
    {
      accessorKey: "last_name",
      header: ({ column }) => (
        <SortableHeader column={column}>Last Name</SortableHeader>
      ),
      cell: ({ row }) => <div>{row.getValue("last_name")}</div>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <SortableHeader column={column}>Role</SortableHeader>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant="outline"
            className={
              role === "admin"
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : role === "instructor"
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-green-100 text-green-800 border-green-300"
            }
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => (
        <StatusButton
          status={row.getValue("is_active") ? "active" : "inactive"}
        />
      ),
    },

    {
      id: "permissions",
      header: () => <div>Permissions</div>,
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 3).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission.split("_")[0]}
              </Badge>
            ))}
            {permissions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{permissions.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(user.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    autoResetPageIndex: false,
  });

  const uniqueRoles = React.useMemo(() => {
    const roles = data.map((item) => item.role).filter(Boolean);
    return Array.from(new Set(roles));
  }, [data]);

  // Export to Excel function
  const exportToExcel = () => {
    try {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const dataToExport = (
        selectedRows.length > 0
          ? selectedRows
          : table.getFilteredRowModel().rows
      ).map((row) => {
        const exportRow: any = {};
        table.getVisibleLeafColumns().forEach((col) => {
          exportRow[col.id] = row.getValue(col.id);
        });
        return exportRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const colWidths = Object.keys(dataToExport[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(
        workbook,
        `users_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );

      setToastMessage({
        message: `Exported ${dataToExport.length} user(s) to Excel`,
        variant: "success",
      });
    } catch (error) {
      setToastMessage({
        message: "Failed to export to Excel",
        variant: "danger",
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    table.resetColumnFilters();
  };

  React.useEffect(() => {
    getUsers();
  }, []);

  // Apply custom filters
  React.useEffect(() => {
    const filters = [];
    if (roleFilter !== "all") {
      filters.push({ id: "role", value: roleFilter });
    }
    if (statusFilter !== "all") {
      filters.push({ id: "is_active", value: statusFilter === "active" });
    }
    setColumnFilters(filters);
  }, [roleFilter, statusFilter]);

  const hasActiveFilters =
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    (table.getColumn("email")?.getFilterValue() as string)?.length > 0;

  return isLoading ? (
    <TableSkeleton />
  ) : (
    <div className="w-full space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search users..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </span>
            )}
            {table.getFilteredSelectedRowModel().rows.length === 0 && (
              <span>
                Showing {table.getFilteredRowModel().rows.length} user(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              size="sm"
              onClick={exportToExcel}
              disabled={table.getFilteredRowModel().rows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border flex-1 overflow-auto px-5 max-h-96">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap font-bold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="text-sm">
              Rows per page:
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-semibold text-lg">
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information and permissions."
                : "Create a new user account with specific permissions."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_staff">Staff Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="is_staff"
                    name="is_staff"
                    checked={formData.is_staff}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_staff: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="is_staff" className="cursor-pointer">
                    Is staff member
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active account
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </Label>
              <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <Label
                      htmlFor={permission}
                      className="text-sm cursor-pointer"
                    >
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingUser ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
