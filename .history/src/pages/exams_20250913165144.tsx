 


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
  ArrowUp,
  ArrowDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Printer,
  Filter,
  X,
  Download,
  ChevronUp,
  Loader,
  ListCheck,
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
import { CourseGroup } from "../contexts/ExamSchedulesContexts";
import { StatusButton } from "../components/ui/status-button";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Badge } from "../components/ui/badge";

export type Exam = {
  id: string;
  course: string;
  group: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  status: string;
  end_date: Date;
};

export type MyExam = {
  id: string;
  course: string;
  group: CourseGroup;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  status: string;
  end_date: Date;
};

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

export function ExamsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isGettingExams, startTransition] = React.useTransition();
  const { setToastMessage } = useToast();
  const [searchParams] = useSearchParams();
  const [data, setData] = React.useState<Exam[]>([]);
  const [currentAttendance, setCurrentAttendance] = React.useState<
    any[] | null
  >(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [isGettingAttendance, startGettingAttendanceTransition] =
    React.useTransition();
  const [viewAttendance, setViewAttendance] = React.useState<boolean>(false);
  const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null);

  // Attendance Modal Specific State
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [signInFilter, setSignInFilter] = React.useState<string>("all");
  const [signOutFilter, setSignOutFilter] = React.useState<string>("all");

  const getCourses = () => {
    startTransition(async () => {
      try {
        const timetableId = searchParams.get("id");
        let resp = null;
        if (timetableId) {
          resp = await axios.get(`/api/exams/exams?id=${timetableId}`);
        } else {
          resp = await axios.get(`/api/exams/exams`);
        }

        setData(
          resp?.data.data.map((data: any) => {
            return {
              ...data,
              id: `${data.id}`,
              code: `${data.group.course.code}`,
              course: `${data.group.course.title}`,
              group: `${data.group.group_name}`,
              date: data.date || data.end_date,
              day: format(new Date(data.date), "EEEE"),
            };
          })
        );
      } catch (error) {
        setToastMessage({
          message: String(error),
          variant: "danger",
        });
      }
    });
  };

  const getAttendance = (exam_id: any) => {
    setViewAttendance(true);
    const exam = data.find((ex) => ex.id === exam_id);
    setSelectedExam(exam || null);
    startGettingAttendanceTransition(async () => {
      try {
        const resp = await axios.get(
          `/api/exams/exams/attendance?exam_id=${exam_id}`
        );
        if (resp.data.success) {
          setCurrentAttendance(resp.data.data);
        }
      } catch (error) {
        setToastMessage({
          message: "Failed to get attendance. Please try again",
          variant: "danger",
        });
      }
    });
  };

  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <SortableHeader column={column}>Course Code</SortableHeader>
      ),
      cell: ({ row }) => (
        <div
          className="font-medium max-w-[200px] truncate"
          title={row.getValue("code")}
        >
          {row.getValue("code")}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "course",
      header: ({ column }) => (
        <SortableHeader column={column}>Course Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <div
          className="font-medium max-w-[200px] truncate"
          title={row.getValue("course")}
        >
          {row.getValue("course")}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "group",
      header: ({ column }) => (
        <SortableHeader column={column}>Group</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("group")}</div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <SortableHeader column={column}>Date</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {format(new Date(row.getValue("date")), "MMM dd, yyyy")}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "day",
      header: ({ column }) => (
        <SortableHeader column={column}>Day</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {format(new Date(row.getValue("date")), "EEEE")}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "start_time",
      header: ({ column }) => (
        <SortableHeader column={column}>Start Time</SortableHeader>
      ),
      cell: ({ row }) => <div>{row.getValue("start_time")}</div>,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "end_time",
      header: ({ column }) => (
        <SortableHeader column={column}>End Time</SortableHeader>
      ),
      cell: ({ row }) => <div>{row.getValue("end_time")}</div>,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => <StatusButton status={row.getValue("status")} />,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "action",
      header: () => <div>Action</div>,
      cell: ({ row }) => (
        <Button
          variant={"secondary"}
          onClick={() => getAttendance(row.original.id)}
        >
          <ListCheck className="w-4 h-4"/>
          Attendance
        </Button>
      ),
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

  const uniqueStatuses = React.useMemo(() => {
    const statuses = data.map((item) => item.status).filter(Boolean);
    return Array.from(new Set(statuses));
  }, [data]);

  const uniqueGroups = React.useMemo(() => {
    const groups = data.map((item) => item.group).filter(Boolean);
    return Array.from(new Set(groups));
  }, [data]);

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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Exams");

      const colWidths = Object.keys(dataToExport[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(
        workbook,
        `exams_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );

      setToastMessage({
        message: `Exported ${dataToExport.length} exam(s) to Excel`,
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
    setStatusFilter("all");
    setGroupFilter("all");
    table.resetColumnFilters();
  };

  React.useEffect(() => {
    getCourses();
  }, [searchParams]);

  // Apply custom filters
  React.useEffect(() => {
    const filters = [];
    if (statusFilter !== "all") {
      filters.push({ id: "status", value: statusFilter });
    }
    if (groupFilter !== "all") {
      filters.push({ id: "group", value: groupFilter });
    }
    setColumnFilters(filters);
  }, [statusFilter, groupFilter]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    groupFilter !== "all" ||
    (table.getColumn("course")?.getFilterValue() as string)?.length > 0;

  // Attendance Filter Computation
  const filteredAttendance = React.useMemo(() => {
    if (!currentAttendance) return [];
    return currentAttendance.filter((att: any) => {
      const matchesSearch =
        !searchTerm ||
        att.student?.reg_no
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        `${att.student?.user?.first_name || ""} ${att.student?.user?.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesSignIn =
        signInFilter === "all" ||
        (signInFilter === "yes" ? att.signin_attendance : !att.signin_attendance);
      const matchesSignOut =
        signOutFilter === "all" ||
        (signOutFilter === "yes" ? att.signout_attendance : !att.signout_attendance);

      return matchesSearch && matchesSignIn && matchesSignOut;
    });
  }, [currentAttendance, searchTerm, signInFilter, signOutFilter]);

  const filteredCount = filteredAttendance.length;

  return isGettingExams ? (
    <TableSkeleton />
  ) : (
    <div className="w-full space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search courses..."
              value={
                (table.getColumn("course")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("course")?.setFilterValue(event.target.value)
              }
              className="max-w-sm border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {uniqueGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
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
                Showing {table.getFilteredRowModel().rows.length} exam(s)
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
                  No exams found.
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

      {/* Attendance Modal */}
      <Dialog open={viewAttendance} onOpenChange={setViewAttendance}>
       <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader className="p-5 pb-3 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <DialogTitle className="font-semibold text-lg">
                  {selectedExam?.course} Attendance on{" "}
                  {format(selectedExam?.date?new Date(selectedExam?.date): new Date(), "MMM dd, yyyy")} from{" "}
                  {selectedExam?.start_time} to {selectedExam?.end_time}
                </DialogTitle>
               
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const worksheet = XLSX.utils.json_to_sheet(
                      filteredAttendance.map((att: any) => ({
                        "Reg No": att.student?.reg_no || "N/A",
                        "Student Name": `${att.student?.user?.first_name || "N/A"} ${
                          att.student?.user?.last_name || ""
                        }`,
                        Faculty: att.exam?.group?.course?.department?.name || "N/A",
                        "Course Code": att.exam?.group?.course?.code || "N/A",
                        Course: att.exam?.group?.course?.title || "N/A",
                        "Sign In": att.signin_attendance ? "Yes" : "No",
                        "Sign Out": att.signout_attendance ? "Yes" : "No",
                      }))
                    );
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(
                      workbook,
                      worksheet,
                      "Attendance"
                    );

                    // Set column widths
                    const colWidths = [
                      { wch: 12 }, // Reg No
                      { wch: 20 }, // Student Name
                      { wch: 18 }, // Faculty
                      { wch: 12 }, // Course Code
                      { wch: 20 }, // Course
                      { wch: 8 }, // Sign In
                      { wch: 8 }, // Sign Out
                    ];
                    worksheet["!cols"] = colWidths;

                    XLSX.writeFile(
                      workbook,
                      `attendance_${selectedExam?.course.replace(/\s+/g, "_")}_${format(
                        new Date(),
                        "yyyy-MM-dd"
                      )}.xlsx`
                    );

                    setToastMessage({
                      message: "Attendance exported to Excel",
                      variant: "success",
                    });
                  }}
                  disabled={!currentAttendance || currentAttendance.length === 0}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Export Excel
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search & Filter Bar */}
          <div className="px-5 py-3 border-b bg-background/50 rounded-t-md flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name or reg no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={signInFilter} onValueChange={setSignInFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sign In" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={signOutFilter} onValueChange={setSignOutFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sign Out" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(signInFilter !== "all" || signOutFilter !== "all" || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSignInFilter("all");
                  setSignOutFilter("all");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Attendance Table */}
          <div className="flex-1 overflow-auto px-5 max-h-96">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow className="border-b dark:hover:bg-gray-750">
                  <TableHead className="font-semibold w-[120px]">Reg No</TableHead>
                  <TableHead className="font-semibold w-[200px]">Student Name</TableHead>
                  <TableHead className="font-semibold w-[160px]">Faculty</TableHead>
                  <TableHead className="font-semibold w-[120px]">Course Code</TableHead>
                  <TableHead className="font-semibold w-[200px]">Course</TableHead>
                  <TableHead className="font-semibold w-[100px]">Sign In</TableHead>
                  <TableHead className="font-semibold w-[100px]">Sign Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isGettingAttendance ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader className="animate-spin h-6 w-6 mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading attendance...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredAttendance.length > 0 ? (
                  filteredAttendance.map((attendance: any, index: number) => (
                    <TableRow
                      key={index}
                      className="border-b transition-colors duration-150 hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {attendance?.student?.reg_no || "N/A"}
                      </TableCell>
                      <TableCell>
                        {attendance?.student?.user?.first_name || "N/A"}{" "}
                        {attendance?.student?.user?.last_name || ""}
                      </TableCell>
                      <TableCell>
                        {attendance?.exam?.group?.course?.department?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        {attendance?.exam?.group?.course?.code || "N/A"}
                      </TableCell>
                      <TableCell>
                        {attendance?.exam?.group?.course?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            attendance?.signin_attendance
                              ? "bg-green-800 text-white border-green-800"
                              : "bg-red-800 text-white border-red-800"
                          }`}
                        >
                          {attendance?.signin_attendance ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            attendance?.signout_attendance
                              ? "bg-green-800 text-white border-green-800"
                              : "bg-red-800 text-white border-red-800"
                          }`}
                        >
                          {attendance?.signout_attendance ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No attendance records found for this filter.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <DialogFooter className="p-5 pt-0">
            <Button
              variant="outline"
              onClick={() => setViewAttendance(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}