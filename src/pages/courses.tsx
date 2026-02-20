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
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/textarea";
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from "react-router-dom";

export type Course = {
  id?: number;
  code: string;
  title: string;
  description: string;
  credits: string;
  instructor: string;
  semester: any;
  start_date: Date;
  end_date: Date;
  enrollment_limit: number;
  prerequisites: any[];
  schedules: any[];
};

export type Department = {
  code: string;
  name: string;
};

interface FormData {
  id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor: number;
  department: number;
  semester: number;
  start_date: Date;
  end_date: Date;
  enrollment_limit: number;
  created_at: Date;
  updated_at: Date;
}

export const columns: ColumnDef<Course>[] = [
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
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "credits",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Credits
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("credits")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "campus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Campus
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("campus")}</div>
    ),
  },
  {
    accessorKey: "semester",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Semester
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("semester")}</div>
    ),
  },
  {
    accessorKey: "enrollments",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enrollments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("enrollments")}</div>
    ),
  },
];

export function CoursesPage() {
  const navigate = useNavigate();
  // if(!hasPermission(Permissions.VIEW_COURSE)){
  //   navigate("/unauthorized")
  // }
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Course[]>([]);
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [campuses, setCampuses] = React.useState<string[]>([]);
  const [semesters, setSemesters] = React.useState<string[]>([]);
  const [isGroupsDialogOpen, setIsGroupsDialogOpen] = React.useState(false);
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(
    null,
  );

  const timeMap={
    "Morning": {start_time: "08:00", end_time: "11:00"},
    "Afternoon": {start_time: "13:00", end_time: "16:00"},
    "Evening": {start_time: "17:00", end_time: "20:00"},
  }
  const [groupTime, setGroupTime] = React.useState<
    "Morning" | "Afternoon" | "Evening"
  >("Morning");
  const [isTimeUpdating, setIsTimeUpdating] = React.useState(false);
  const [selectedCourseGroups, setSelectedCourseGroups] = React.useState<any[]>(
    [],
  );

  const getCourseGroups = async (courseId: number) => {
    try {
      const resp = await axios.get(`/api/courses/${courseId}/course-groups/`);
      setSelectedCourseGroups(resp.data.data);
    } catch (error) {
      console.error("Error fetching course groups:", error);
    }
  };

  const updateCourseGroupTimes = async () => {
    if (!selectedCourseId || !selectedGroupId) return;
    setIsTimeUpdating(true);
    try {
      await axios.put(
        `/api/courses/update-course-group-times/${selectedCourseId}/${selectedGroupId}/`,
        { dayTime: groupTime },
      );
    } catch {
      console.log("Error of updating time");
    }finally {
      setIsTimeUpdating(false);
      getCourseGroups(selectedCourseId);
    }
  };
  const fetchCourses = () => {
    startTransition(async () => {
      setError(null);
      try {
        const resp = await axios.get("/api/courses/");
        const coursesData = resp.data.data.map((data: any) => ({
          ...data,
          department: data.department.name,
          enrollments: data.students_enrolled,
          semester: data.semester.name,
          campus: data.department?.location?.name || "Unknown Campus",
        }));

        setData(coursesData);

        // Extract unique values for filters
        const uniqueDepartments = [
          ...new Set(
            coursesData.map((course: { department: any }) => course.department),
          ),
        ].filter(Boolean) as string[];
        const uniqueCampuses = [
          ...new Set(
            coursesData.map((course: { campus: any }) => course.campus),
          ),
        ].filter(Boolean) as string[];
        const uniqueSemesters = [
          ...new Set(
            coursesData.map((course: { semester: any }) => course.semester),
          ),
        ].filter(Boolean) as string[];

        setDepartments(uniqueDepartments);
        setCampuses(uniqueCampuses);
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch courses");
      }
    });
  };

  React.useEffect(() => {
    if (isGroupsDialogOpen && selectedCourseId) {
      getCourseGroups(selectedCourseId);
    }else{
      setSelectedCourseGroups([]);
      setSelectedCourseId(null);
      setSelectedGroupId(null);
    }
  }, [isGroupsDialogOpen]);

  React.useEffect(() => {
    fetchCourses();
  }, []);

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
  });

  // Fix for Select component - ensure all values are non-empty strings
  const departmentFilterValue =
    (table.getColumn("department")?.getFilterValue() as string) || "all";
  const campusFilterValue =
    (table.getColumn("campus")?.getFilterValue() as string) || "all";

  return isLoading ? (
    <TableSkeleton />
  ) : error ? (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button variant="outline" onClick={() => fetchCourses()}>
        Retry
      </Button>
    </div>
  ) : (
    <Dialog>
      <div className="w-full p-4">
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 p-4   rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title-filter">Title</Label>
              <Input
                id="title-filter"
                placeholder="Filter titles..."
                value={
                  (table.getColumn("title")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="code-filter">Code</Label>
              <Input
                id="code-filter"
                placeholder="Filter codes..."
                value={
                  (table.getColumn("code")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("code")?.setFilterValue(event.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="department-filter">Department</Label>
              <Select
                value={departmentFilterValue}
                onValueChange={(value) =>
                  table
                    .getColumn("department")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="campus-filter">Campus</Label>
              <Select
                value={campusFilterValue}
                onValueChange={(value) =>
                  table
                    .getColumn("campus")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus} value={campus}>
                      {campus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search all columns..."
              value={
                (table.getColumn("global")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}

                    <TableCell>
                      {/* open dialog and for managing the selected course groups */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsGroupsDialogOpen(!isGroupsDialogOpen);
                              setSelectedCourseId(Number(row.original.id));
                            }}
                            className="ml-2"
                          >
                            Manage Groups
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Manage Course Groups</DialogTitle>
                          </DialogHeader>
                          {/* display course groups*/}
                          <div>
                            {selectedCourseGroups.length > 0 ? (
                              <ul className="space-y-2">
                                {selectedCourseGroups.map((group) => (
                                  <li
                                    key={group.id}
                                    className="p-4 border rounded-md"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold">
                                          {group.group_name}
                                        </h3>
                                        
                                      </div>
                                      <div>
                                        <Select
                                          value={group.start_time ? Object.keys(timeMap).find(key => timeMap[key].start_time === group.start_time) : "Morning"}
                                          onValueChange={(value) => {
                                            setGroupTime(
                                              value as
                                                | "Morning"
                                                | "Afternoon"
                                                | "Evening",
                                            );
                                            setSelectedGroupId(group.id);
                                            updateCourseGroupTimes();
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Select time" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {[
                                              "Morning",
                                              "Afternoon",
                                              "Evening",
                                            ].map((time) => (
                                              <SelectItem
                                                key={time}
                                                value={time}
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center text-muted-foreground">
                                No groups found for this course.
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>

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

          <div className="flex items-center space-x-2">
            <span className="text-sm">Rows per page:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Course Dialog */}
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course.
            </DialogDescription>
          </DialogHeader>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <Label htmlFor="code">Module Code</Label>
                <Input id="code" name="code" placeholder="e.g. CS101" />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Intro to CS" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Course description..."
                />
              </div>

              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  placeholder="e.g. 3"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor ID</Label>
                <Input
                  id="instructor"
                  name="instructor"
                  type="number"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department ID</Label>
                <Input
                  id="department"
                  name="department"
                  type="number"
                  placeholder="e.g. 2"
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  type="number"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="enrollment_limit">Enrollment Limit</Label>
                <Input
                  id="enrollment_limit"
                  name="enrollment_limit"
                  type="number"
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Create Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
