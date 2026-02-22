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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Printer,
  Filter,
  X,
  Download,
  Loader,
  ListCheck,
  FileText,
  Building2,
  CalendarDays,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Badge } from "../components/ui/badge";
import { hasPermission } from "../hooks/hasPermission";
import { Permissions } from "../lib/permissions";

export type Exam = {
  id: string;
  code: string;
  course: string;
  group: string;
  department: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  status: string;
};

// ── Types for grouped view ────────────────────────────────────────────────────
type CourseRow = {
  courseTitle: string;
  courseCode: string;
  teacher: string;
  groups: string[];
  room: string;
  status: string;
  examIds: string[];
};
type TimeSlot = { time: string; courses: CourseRow[] };
type DateGroup = { date: string; day: string; slots: TimeSlot[] };
type DeptGroup = { dept: string; dates: DateGroup[] };

// ── Sortable header helper ────────────────────────────────────────────────────
const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="h-auto p-0 font-medium hover:bg-transparent"
  >
    {children}
    {column.getIsSorted() === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )}
  </Button>
);

// ── Group flat exams into dept → date → time → merged courses ─────────────────
function groupExams(exams: Exam[]): DeptGroup[] {
  // dept → date → time → course_key → CourseRow
  const tree: Record<string, Record<string, Record<string, Record<string, CourseRow>>>> = {};

  for (const exam of exams) {
    const dept = exam.department || "No Department";
    const dateKey = exam.date ? format(new Date(exam.date), "yyyy-MM-dd") : "No Date";
    const timeKey = exam.start_time || "No Time";
    const courseKey = `${exam.code}__${exam.start_time}`;

    if (!tree[dept]) tree[dept] = {};
    if (!tree[dept][dateKey]) tree[dept][dateKey] = {};
    if (!tree[dept][dateKey][timeKey]) tree[dept][dateKey][timeKey] = {};
    if (!tree[dept][dateKey][timeKey][courseKey]) {
      tree[dept][dateKey][timeKey][courseKey] = {
        courseTitle: exam.course,
        courseCode: exam.code,
        teacher: "",           // teacher not in flat data — show from group
        groups: [],
        room: exam.room,
        status: exam.status,
        examIds: [],
      };
    }
    tree[dept][dateKey][timeKey][courseKey].groups.push(exam.group);
    tree[dept][dateKey][timeKey][courseKey].examIds.push(exam.id);
  }

  return Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dept, dates]) => ({
      dept,
      dates: Object.entries(dates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, times]) => ({
          date: dateKey !== "No Date" ? format(new Date(dateKey), "dd-MMM-yyyy") : "No Date",
          day:  dateKey !== "No Date" ? format(new Date(dateKey), "EEEE") : "",
          slots: Object.entries(times)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([timeKey, courses]) => ({
              time: timeKey,
              courses: Object.values(courses),
            })),
        })),
    }));
}

// ── Department banner ─────────────────────────────────────────────────────────
function DeptBanner({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-md text-white font-semibold text-sm tracking-wide"
         style={{ backgroundColor: "#004594" }}>
      <Building2 className="h-4 w-4 opacity-80" />
      {name.toUpperCase()}
    </div>
  );
}

// ── Grouped exams view ────────────────────────────────────────────────────────
function GroupedView({
  groups,
  onAttendance,
}: {
  groups: DeptGroup[];
  onAttendance: (examId: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  if (groups.length === 0)
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No exams found.
      </div>
    );

  return (
    <div className="space-y-6">
      {groups.map((deptGroup) => (
        <div key={deptGroup.dept}>
          {/* Department banner */}
          <DeptBanner name={deptGroup.dept} />

          <div className="mt-2 space-y-3">
            {deptGroup.dates.map((dateGroup) => {
              const dateKey = `${deptGroup.dept}__${dateGroup.date}`;
              const isCollapsed = collapsed[dateKey];

              return (
                <div key={dateGroup.date} className="border rounded-lg overflow-hidden">
                  {/* Date header row */}
                  <button
                    onClick={() => toggle(dateKey)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/60 hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{dateGroup.day}</span>
                      <span className="text-muted-foreground">{dateGroup.date}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isCollapsed ? "" : "rotate-90"
                      }`}
                    />
                  </button>

                  {!isCollapsed && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/20 text-xs text-muted-foreground">
                          <th className="px-4 py-2 text-left font-medium w-[110px]">Time</th>
                          <th className="px-4 py-2 text-left font-medium w-[90px]">Code</th>
                          <th className="px-4 py-2 text-left font-medium">Course</th>
                          <th className="px-4 py-2 text-left font-medium w-[80px]">Group(s)</th>
                          <th className="px-4 py-2 text-left font-medium w-[100px]">Room</th>
                          <th className="px-4 py-2 text-left font-medium w-[90px]">Status</th>
                          <th className="px-4 py-2 w-[50px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateGroup.slots.map((slot, si) =>
                          slot.courses.map((course, ci) => (
                            <tr
                              key={`${si}-${ci}`}
                              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              {/* Time — only on first course of slot */}
                              <td className="px-4 py-2.5">
                                {ci === 0 ? (
                                  <div className="flex items-center gap-1.5 text-xs font-medium"
                                       style={{ color: "#004594" }}>
                                    <Clock className="h-3 w-3" />
                                    {slot.time}
                                  </div>
                                ) : null}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                                {course.courseCode}
                              </td>
                              <td className="px-4 py-2.5 font-medium">{course.courseTitle}</td>
                              <td className="px-4 py-2.5">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                      style={{ borderColor: "#004594", color: "#004594" }}>
                                  {course.groups.join(", ")}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {course.room || "–"}
                              </td>
                              <td className="px-4 py-2.5">
                                <StatusButton status={course.status} />
                              </td>
                              <td className="px-4 py-2.5">
                                {hasPermission(Permissions.CHANGE_EXAM) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onAttendance(course.examIds[0])}
                                    title="View attendance"
                                  >
                                    <ListCheck className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function ExamsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isGettingExams, startTransition] = React.useTransition();
  const { setToastMessage } = useToast();
  const [searchParams] = useSearchParams();
  const [data, setData] = React.useState<Exam[]>([]);
  const [viewMode, setViewMode] = React.useState<"grouped" | "table">("grouped");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);

  // Attendance modal state
  const [currentAttendance, setCurrentAttendance] = React.useState<any[] | null>(null);
  const [isGettingAttendance, startGettingAttendanceTransition] = React.useTransition();
  const [viewAttendance, setViewAttendance] = React.useState(false);
  const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [signInFilter, setSignInFilter] = React.useState("all");
  const [signOutFilter, setSignOutFilter] = React.useState("all");

 const getCourses = () => {
  startTransition(async () => {
    try {
      const timetableId = searchParams.get("id");
      const url = timetableId
        ? `/api/exams/exams?id=${timetableId}`
        : `/api/exams/exams`;
      const resp = await axios.get(url);

      // Log the response to debug
      console.log("Server response:", resp.data);

      // Correctly map the nested data structure
      const mappedData = resp?.data.data.map((d: any) => ({
        id: d.id.toString(),
        code: d.group?.course?.code ?? "",
        course: d.group?.course?.title ?? "",
        group: d.group?.group_name ?? "",
        department: d.group?.course?.department?.name ?? "",
        date: d.date || "",
        start_time: d.start_time || "",
        end_time: d.end_time || "",
        room: d.room?.name || "",
        status: d.status || "",
      }));

      console.log("Mapped data:", mappedData);
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setToastMessage({ message: String(error), variant: "danger" });
    }
  });
};

  const getAttendance = (exam_id: string) => {
    setViewAttendance(true);
    setSelectedExam(data.find((ex) => ex.id === exam_id) || null);
    startGettingAttendanceTransition(async () => {
      try {
        const resp = await axios.get(`/api/exams/exams/attendance?exam_id=${exam_id}`);
        if (resp.data.success) setCurrentAttendance(resp.data.data);
      } catch {
        setToastMessage({ message: "Failed to get attendance.", variant: "danger" });
      }
    });
  };

  // ── PDF export ──────────────────────────────────────────────────────────────
  const exportToPdf = async () => {
    const timetableId = searchParams.get("id");
    if (!timetableId) {
      setToastMessage({ message: "No timetable selected.", variant: "danger" });
      return;
    }
    setIsExportingPdf(true);
    try {
      const resp = await axios.get(
        `/api/report/?id=${timetableId}&report=timetable`,
        { responseType: "blob" }
      );
      const url  = URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href     = url;
      link.download = `exam_timetable_${timetableId}_${format(new Date(), "yyyyMMdd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setToastMessage({ message: "PDF downloaded successfully.", variant: "success" });
    } catch {
      setToastMessage({ message: "Failed to export PDF.", variant: "danger" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ── Columns (table mode) ────────────────────────────────────────────────────
  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: "department",
      header: ({ column }) => <SortableHeader column={column}>Department</SortableHeader>,
      cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.getValue("department")}</div>,
    },
    {
      accessorKey: "code",
      header: ({ column }) => <SortableHeader column={column}>Code</SortableHeader>,
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "course",
      header: ({ column }) => <SortableHeader column={column}>Course</SortableHeader>,
      cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("course")}</div>,
    },
    {
      accessorKey: "group",
      header: ({ column }) => <SortableHeader column={column}>Group</SortableHeader>,
      cell: ({ row }) => <div>{row.getValue("group")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => (
        <div>{row.getValue("date") ? format(new Date(row.getValue("date")), "MMM dd, yyyy") : "–"}</div>
      ),
    },
    {
      accessorKey: "start_time",
      header: ({ column }) => <SortableHeader column={column}>Start</SortableHeader>,
      cell: ({ row }) => <div>{row.getValue("start_time")}</div>,
    },
    {
      accessorKey: "end_time",
      header: ({ column }) => <SortableHeader column={column}>End</SortableHeader>,
      cell: ({ row }) => <div>{row.getValue("end_time")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
      cell: ({ row }) => <StatusButton status={row.getValue("status")} />,
    },
    {
      accessorKey: "action",
      header: () => <div />,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {hasPermission(Permissions.CHANGE_EXAM) && (
              <DropdownMenuItem onClick={() => getAttendance(row.original.id)}>
                <ListCheck className="w-4 h-4 mr-2" />Attendance
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 10 } },
    autoResetPageIndex: false,
  });

  // ── Derived data ────────────────────────────────────────────────────────────
  const uniqueStatuses = React.useMemo(
    () => Array.from(new Set(data.map((d) => d.status).filter(Boolean))),
    [data]
  );
  const uniqueGroups = React.useMemo(
    () => Array.from(new Set(data.map((d) => d.group).filter(Boolean))),
    [data]
  );

  const filteredData = React.useMemo(() => {
    return data.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (groupFilter  !== "all" && d.group  !== groupFilter)  return false;
      return true;
    });
  }, [data, statusFilter, groupFilter]);

  const groupedData = React.useMemo(() => groupExams(filteredData), [filteredData]);

  const filteredAttendance = React.useMemo(() => {
    if (!currentAttendance) return [];
    return currentAttendance.filter((att: any) => {
      const name = `${att.student?.user?.first_name ?? ""} ${att.student?.user?.last_name ?? ""}`.toLowerCase();
      const matchSearch = !searchTerm || att.student?.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
      const matchIn  = signInFilter  === "all" || (signInFilter  === "yes" ? att.signin_attendance  : !att.signin_attendance);
      const matchOut = signOutFilter === "all" || (signOutFilter === "yes" ? att.signout_attendance : !att.signout_attendance);
      return matchSearch && matchIn && matchOut;
    });
  }, [currentAttendance, searchTerm, signInFilter, signOutFilter]);

  const hasActiveFilters = statusFilter !== "all" || groupFilter !== "all";

  const exportToExcel = () => {
    try {
      const rows = (viewMode === "table"
        ? table.getFilteredRowModel().rows.map((r) => r.original)
        : filteredData
      ).map((d) => ({
        Department: d.department,
        Code: d.code,
        Course: d.course,
        Group: d.group,
        Date: d.date ? format(new Date(d.date), "MMM dd, yyyy") : "",
        "Start Time": d.start_time,
        "End Time": d.end_time,
        Status: d.status,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Exams");
      XLSX.writeFile(wb, `exams_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      setToastMessage({ message: `Exported ${rows.length} exam(s)`, variant: "success" });
    } catch {
      setToastMessage({ message: "Failed to export Excel", variant: "danger" });
    }
  };

  React.useEffect(() => { getCourses(); }, [searchParams]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isGettingExams) return <TableSkeleton />;

  return (
    <div className="w-full space-y-4">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 border rounded-lg">

        {/* Top row: search + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Search courses..."
              value={(table.getColumn("course")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("course")?.setFilterValue(e.target.value)}
              className="max-w-sm border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {uniqueGroups.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={() => { setStatusFilter("all"); setGroupFilter("all"); }}>
              <X className="h-4 w-4 mr-1" />Clear
            </Button>
          )}
        </div>

        {/* Bottom row: info + view toggle + actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredData.length} exam(s)
          </span>

          <div className="flex items-center gap-2">

            {/* View toggle */}
            <div className="flex rounded-md border overflow-hidden">
              <button
                onClick={() => setViewMode("grouped")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "grouped"
                    ? "text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                style={viewMode === "grouped" ? { backgroundColor: "#004594" } : {}}
              >
                Grouped
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-l ${
                  viewMode === "table"
                    ? "text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                style={viewMode === "table" ? { backgroundColor: "#004594" } : {}}
              >
                Table
              </button>
            </div>

            {/* Column toggle (table mode only) */}
            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table.getAllColumns().filter((c) => c.getCanHide()).map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      className="capitalize"
                      checked={c.getIsVisible()}
                      onCheckedChange={(v) => c.toggleVisibility(!!v)}
                    >
                      {c.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export Excel */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              disabled={filteredData.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>

            {/* Export PDF */}
            <Button
              size="sm"
              onClick={exportToPdf}
              disabled={isExportingPdf || !searchParams.get("id")}
              style={{ backgroundColor: "#004594" }}
              className="text-white hover:opacity-90"
            >
              {isExportingPdf ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      {viewMode === "grouped" ? (
        <div className="border rounded-lg p-4 space-y-4">
          <GroupedView groups={groupedData} onAttendance={getAttendance} />
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-auto max-h-[500px] px-5">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="whitespace-nowrap font-bold">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Rows:</Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(v) => table.setPageSize(Number(v))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50].map((n) => (
                      <SelectItem key={n} value={`${n}`}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>First</Button>
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last</Button>
            </div>
          </div>
        </>
      )}

      {/* ── Attendance modal ──────────────────────────────────────────────── */}
      <Dialog open={viewAttendance} onOpenChange={setViewAttendance}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader className="p-5 pb-3 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <DialogTitle className="font-semibold text-lg">
                {selectedExam?.course} — Attendance
                <span className="block text-sm font-normal text-muted-foreground mt-0.5">
                  {selectedExam?.date ? format(new Date(selectedExam.date), "MMM dd, yyyy") : ""}{" "}
                  {selectedExam?.start_time} – {selectedExam?.end_time}
                </span>
              </DialogTitle>
              <Button
                variant="default"
                size="sm"
                disabled={!currentAttendance?.length}
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(
                    filteredAttendance.map((a: any) => ({
                      "Reg No": a.student?.reg_no || "N/A",
                      "Student Name": `${a.student?.user?.first_name ?? ""} ${a.student?.user?.last_name ?? ""}`.trim(),
                      Faculty: a.exam?.group?.course?.department?.name || "N/A",
                      "Course Code": a.exam?.group?.course?.code || "N/A",
                      Course: a.exam?.group?.course?.title || "N/A",
                      "Sign In": a.signin_attendance ? "Yes" : "No",
                      "Sign Out": a.signout_attendance ? "Yes" : "No",
                    }))
                  );
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
                  XLSX.writeFile(wb, `attendance_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
                  setToastMessage({ message: "Attendance exported", variant: "success" });
                }}
              >
                <Download className="h-4 w-4 mr-1" />Export Excel
              </Button>
            </div>
          </DialogHeader>

          {/* Filters */}
          <div className="px-5 py-3 border-b flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Search by name or reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] border-primary"
            />
            <Select value={signInFilter} onValueChange={setSignInFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Sign In" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Signed In</SelectItem>
                <SelectItem value="no">Not Signed In</SelectItem>
              </SelectContent>
            </Select>
            <Select value={signOutFilter} onValueChange={setSignOutFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Sign Out" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Signed Out</SelectItem>
                <SelectItem value="no">Not Signed Out</SelectItem>
              </SelectContent>
            </Select>
            {(signInFilter !== "all" || signOutFilter !== "all" || searchTerm) && (
              <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setSignInFilter("all"); setSignOutFilter("all"); }}>
                <X className="h-4 w-4 mr-1" />Clear
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 px-5 overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  {["Reg No","Student Name","Faculty","Course Code","Course","Sign In","Sign Out"].map((h) => (
                    <TableHead key={h} className="font-semibold whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isGettingAttendance ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader className="animate-spin h-6 w-6 mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAttendance.length > 0 ? (
                  filteredAttendance.map((a: any, i: number) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{a.student?.reg_no ?? "N/A"}</TableCell>
                      <TableCell>{`${a.student?.user?.first_name ?? ""} ${a.student?.user?.last_name ?? ""}`.trim() || "N/A"}</TableCell>
                      <TableCell>{a.exam?.group?.course?.department?.name ?? "N/A"}</TableCell>
                      <TableCell>{a.exam?.group?.course?.code ?? "N/A"}</TableCell>
                      <TableCell>{a.exam?.group?.course?.title ?? "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={a.signin_attendance ? "bg-green-800 text-white border-green-800" : "bg-red-800 text-white border-red-800"}>
                          {a.signin_attendance ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={a.signout_attendance ? "bg-green-800 text-white border-green-800" : "bg-red-800 text-white border-red-800"}>
                          {a.signout_attendance ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="p-5 pt-0">
            <Button variant="outline" onClick={() => setViewAttendance(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}