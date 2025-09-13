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
  ChevronDown,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
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
import { Badge } from "../components/ui/badge";
import TableSkeleton from "../components/TableSkeleton";
import { StatusButton } from "../components/ui/status-button";

export type StudentExam = {
  id: string;
  reg_no: string;
  department: string;
  exam: string;
  room: string;
  status: string;
  email: string;
  date: string;
};

// Define possible values for filters
const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed"];
const DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Business",
];

export const columns: ColumnDef<StudentExam>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "reg_no",
    header: "Reg Number",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue("reg_no")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="lowercase text-sm text-muted-foreground">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.getValue("department")}
      </Badge>
    ),
  },
  {
    accessorKey: "exam",
    header: "Exam",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-xs" title={row.getValue("exam")}>
        {row.getValue("exam")}
      </div>
    ),
  },
  {
    accessorKey: "room",
    header: "Room",
    cell: ({ row }) => (
      <div className="font-mono text-xs bg-secondary px-2 py-1 rounded">
        {row.getValue("room")}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">Date</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm text-muted-foreground">
        {new Date(row.getValue("date")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }) => <StatusButton status={row.getValue("status")} />,
  },
];

export function AllocationsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<StudentExam[]>([]);
  const [counts, setCounts] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(7); // Fixed to match backend
  const [totalPages, setTotalPages] = React.useState<number>(0);

  // Filters state
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("");

  // Pagination URLs
  const [nextUrl, setNextUrl] = React.useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = React.useState<string | null>(null);

  // Debounce global filter
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (globalFilter.length > 0 || globalFilter === "") {
        setCurrentPage(1); // Reset to first page on search
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  const fetchExams = React.useCallback(
    (url?: string | null) => {
      startTransition(async () => {
        try {
          const resp = await axios.request({
            url: url ?? `/api/exams/student-exam/?limit=${pageSize}&offset=${
              (currentPage - 1) * pageSize
            }`,
            method: "get",
            baseURL: undefined,
          });

          setCounts(resp.data.count);
          setTotalPages(Math.ceil(resp.data.count / pageSize));
          setNextUrl(resp.data.next);
          setPreviousUrl(resp.data.previous);

          const formattedData = resp.data.results.map((item: any) => ({
            ...item,
            reg_no: item.student?.reg_no || "",
            email: item.student?.user?.email || "",
            department: item.student?.department?.name || "",
            exam: item.exam?.group?.course?.title || "",
            date: item.exam?.date || "",
            room: item.exam?.room || "",
            status: item.status || "",
          }));

          setData(formattedData);
          setError(null);
        } catch (error: any) {
          if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
            console.log("Request was canceled.");
          } else {
            console.error("Request error:", error);
            setError(error.response?.data?.detail || error.message || "Failed to load data. Please try again.");
          }
        }
      });
    },
    [axios, currentPage, pageSize]
  );

  // Fetch data on initial load or when filters/page change
  React.useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Re-fetch when filters change
  React.useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedStatus, selectedDepartment]);

  // Re-fetch when page changes
  React.useEffect(() => {
    if (currentPage >= 1 && currentPage <= totalPages) {
      fetchExams();
    }
  }, [currentPage, fetchExams, totalPages]);

  // Handle next/prev pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Apply filters to columnFilters state
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (selectedStatus) {
      filters.push({ id: "status", value: selectedStatus });
    }

    if (selectedDepartment) {
      filters.push({ id: "department", value: selectedDepartment });
    }

    setColumnFilters(filters);
  }, [selectedStatus, selectedDepartment]);

  // Global filter logic
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const valuesToCheck = [
        row.original.reg_no,
        row.original.email,
        row.original.department,
        row.original.exam,
        row.original.room,
        row.original.status,
        row.original.date,
      ];
      return valuesToCheck.some((value) =>
        (value || "").toLowerCase().includes(search)
      );
    },
  });

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Render page numbers (show up to 5 pages around current)
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (left > 1) {
      pages.unshift("...");
    }
    if (right < totalPages) {
      pages.push("...");
    }

    // Always show first and last
    if (pages[0] !== 1) pages.unshift(1);
    if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);

    return pages;
  };

  if (isLoading) return <TableSkeleton />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full p-6">
        <div className="text-red-500 mb-4 text-center">{error}</div>
        <Button
          variant="outline"
          onClick={() => fetchExams()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <h2 className="text-2xl font-bold">Student Exam Allocations</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reset Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGlobalFilter("");
              setSelectedStatus("");
              setSelectedDepartment("");
              setCurrentPage(1);
            }}
            disabled={!globalFilter && !selectedStatus && !selectedDepartment}
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <SelectTrigger className="w-[180px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  <StatusButton status={status} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select
            value={selectedDepartment}
            onValueChange={(value) => setSelectedDepartment(value)}
          >
            <SelectTrigger className="w-[180px] text-sm">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students, emails, rooms..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-[200px] text-sm"
            />
          </div>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/_/g, " ").toUpperCase()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-32 text-center text-muted-foreground"
                >
                  No results found. Adjust your filters or search terms.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{table.getFilteredSelectedRowModel().rows.length} selected</span>
          <span>•</span>
          <span>{counts} total</span>
        </div>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`w-9 h-9 p-0 ${currentPage === page ? "text-white" : ""}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 py-1 text-sm text-muted-foreground">
                  ...
                </span>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            aria-label="Next page"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}