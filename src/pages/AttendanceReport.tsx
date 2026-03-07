import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  UserCheck,
  UserX,
  Download,
  Eye,
  ChevronRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";

// ── Types ─────────────────────────────────────────────────────────────────────
type Timetable = { id: number; label: string };

/** One exam inside a course bucket (returned by /stats/) */
type ExamEntry = {
  exam_id: number;
  group: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  status: string;
  total: number;
  signed_in: number;
  absent: number;
  cheating_reports: number;
};

/** Course-level summary returned by /stats/ */
type CourseSummary = {
  course_code: string;
  course_title: string;
  total: number;
  signed_in: number;
  absent: number;
  cheating_reports: number;
  signed_out: number;
  exams: ExamEntry[];
};

type DashboardStats = {
  total_students: number;
  signed_in: number;
  signed_out: number;
  absent: number;
  cheating_reports: number;
};

type CheatingReport = {
  id: number;
  severity: "low" | "medium" | "high";
  status: "pending" | "under_review" | "confirmed" | "dismissed";
  incident_description: string;
  reported_by: string;
  created_at: string;
  evidence_count: number;
} | null;

type StudentRow = {
  id: number;
  student_id: number;
  reg_no: string;
  name: string;
  department: string;
  signin: boolean;
  room: string;
  group?: string;
  signout: boolean;
  status: string;
  cheated: boolean;
  cheating_report: CheatingReport;
};

/** One exam group inside the course attendance response */
type ExamGroup = {
  exam: {
    id: number;
    group: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
  };
  students: StudentRow[];
  summary: {
    total: number;
    signed_in: number;
    signed_out: number;
    absent: number;
    cheating_reports: number;
  };
};

/** Full response from GET /api/report/attendance/?course_code=&timetable_id= */
type CourseAttendanceData = {
  course: { code: string; title: string };
  timetable_id: number;
  exam_groups: ExamGroup[];
  summary: {
    total: number;
    signed_in: number;
    signed_out: number;
    absent: number;
    cheating_reports: number;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt12 = (t: string) => {
  if (!t) return "–";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const fmtDate = (d: string) => {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SEVERITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  medium: {
    label: "Medium",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  high: { label: "High", color: "bg-red-100 text-red-800 border-red-300" },
};

const REPORT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-gray-100 text-gray-700",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    color: "bg-blue-100 text-blue-700",
  },
  confirmed: {
    label: "Confirmed",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-700",
  },
  dismissed: {
    label: "Dismissed",
    icon: ShieldX,
    color: "bg-green-100 text-green-700",
  },
};

const EXAM_STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 flex items-center gap-4 ${color}`}
    >
      <div className="rounded-lg p-2 bg-white/60">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs opacity-70">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Mini summary pill row ─────────────────────────────────────────────────────
function SummaryPills({
  total,
  signed_in,
  absent,
  cheating_reports,
}: {
  total: number;
  signed_in: number;
  absent: number;
  cheating_reports: number;
}) {
  const pct = total > 0 ? Math.round((signed_in / total) * 100) : 0;
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
        {total} total
      </span>
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
        <UserCheck className="h-3 w-3" /> {signed_in} present ({pct}%)
      </span>
      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
        <UserX className="h-3 w-3" /> {absent} absent
      </span>
      {cheating_reports > 0 && (
        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> {cheating_reports} cheating
        </span>
      )}
    </div>
  );
}

// ── Course Card (replaces ExamCard) ───────────────────────────────────────────
function CourseCard({
  course,
  onClick,
}: {
  course: CourseSummary;
  onClick: () => void;
}) {
  const pct =
    course.total > 0 ? Math.round((course.signed_in / course.total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,69,148,0.12)" }}
      className="rounded-xl border bg-card p-5 cursor-pointer transition-all"
      onClick={onClick}
    >
      {/* Course title */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-sm text-primary">{course.course_code}</p>
          <p className="font-semibold text-sm leading-snug mt-0.5">
            {course.course_title}
          </p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {course.exams.length} exam{course.exams.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Attendance bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Overall Attendance</span>
          <span className="font-semibold">
            {course.signed_in}/{course.total} ({pct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <SummaryPills
          total={course.total}
          signed_in={course.signed_in}
          absent={course.absent}
          cheating_reports={course.cheating_reports}
        />
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
      </div>

      {/* Exam dates strip */}
      <div className="mt-3 flex flex-wrap gap-1">
        {course.exams.map((e) => (
          <span
            key={e.exam_id}
            className={`text-xs px-2 py-0.5 rounded-full border ${EXAM_STATUS_COLOR[e.status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {e.group} · {fmtDate(e.date)}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function FlatAttendanceTable({
  rows,
  columns,
  filterCheated,
  globalFilter,
}: {
  rows: StudentRow[];
  columns: ColumnDef<StudentRow>[];
  filterCheated: boolean;
  globalFilter: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableData = React.useMemo(
    () => (filterCheated ? rows.filter((s) => s.cheated) : rows),
    [rows, filterCheated],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
    globalFilterFn: (row, _, val) => {
      const q = val.toLowerCase();
      return [
        row.original.reg_no,
        row.original.name,
        row.original.department,
        row.original.group ?? "",
      ].some((v) => v.toLowerCase().includes(q));
    },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-muted/50">
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  className="text-xs font-semibold text-center"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  row.original.cheated
                    ? "bg-amber-50/60 hover:bg-amber-50"
                    : row.original.signin
                      ? "hover:bg-muted/40"
                      : "bg-red-50/40 hover:bg-red-50/60"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-16 text-center text-muted-foreground text-sm"
              >
                No students match the current filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} student(s)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-xs">
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Collapsible Exam Section (inside course detail view) ──────────────────────
function ExamSection({
  examGroup,
  columns,
  filterCheated,
  globalFilter,
  onReview,
}: {
  examGroup: ExamGroup;
  columns: ColumnDef<StudentRow>[];
  filterCheated: boolean;
  globalFilter: string;
  onReview: (row: StudentRow) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const { exam, students, summary } = examGroup;

  const tableData = React.useMemo(() => {
    const rows = filterCheated ? students.filter((s) => s.cheated) : students;
    return rows.map((s) => ({ ...s, group: exam.group }));
  }, [students, filterCheated, exam.group]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [localFilter, setLocalFilter] = React.useState(globalFilter);

  // keep local filter in sync with parent
  React.useEffect(() => setLocalFilter(globalFilter), [globalFilter]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setLocalFilter,
    state: { sorting, globalFilter: localFilter },
    globalFilterFn: (row, _, val) => {
      const q = val.toLowerCase();
      return [
        row.original.reg_no,
        row.original.name,
        row.original.department,
      ].some((v) => v.toLowerCase().includes(q));
    },
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Exam sub-header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            className={`text-xs ${EXAM_STATUS_COLOR[exam.status] ?? "bg-gray-100 text-gray-700"} border`}
          >
            {exam.status}
          </Badge>
          <span className="font-semibold text-sm">Group: {exam.group}</span>
          <span className="text-xs text-muted-foreground">
            {fmtDate(exam.date)} · {fmt12(exam.start_time)} –{" "}
            {fmt12(exam.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SummaryPills
            total={summary.total}
            signed_in={summary.signed_in}
            absent={summary.absent}
            cheating_reports={summary.cheating_reports}
          />
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Collapsible table */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="bg-muted/50">
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className="text-xs font-semibold text-center"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={
                        row.original.cheated
                          ? "bg-amber-50/60 hover:bg-amber-50"
                          : row.original.signin
                            ? "hover:bg-muted/40"
                            : "bg-red-50/40 hover:bg-red-50/60"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-center py-2.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-16 text-center text-muted-foreground text-sm"
                    >
                      No students match the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination per exam */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} student(s)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">
                    {table.getState().pagination.pageIndex + 1} /{" "}
                    {table.getPageCount()}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AttendanceReport() {
  const axios = useUserAxios();
  const { setToastMessage } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [timetables, setTimetables] = React.useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = React.useState<string>("");
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [courses, setCourses] = React.useState<CourseSummary[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(false);

  // Drill-down: course attendance
  const [selectedCourse, setSelectedCourse] =
    React.useState<CourseSummary | null>(null);
  const [courseAttendance, setCourseAttendance] =
    React.useState<CourseAttendanceData | null>(null);
  const [loadingAttendance, setLoadingAttendance] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [filterCheated, setFilterCheated] = React.useState(false);
  const flatRows = React.useMemo(() => {
    if (!courseAttendance) return [];
    return courseAttendance.exam_groups.flatMap((eg) =>
      eg.students.map((s) => ({
        ...s,
        group: eg.exam.group,
        room: s.room || "–",
      })),
    );
  }, [courseAttendance]);

  // Review dialog
  const [reviewDialog, setReviewDialog] = React.useState<{
    open: boolean;
    row: StudentRow | null;
  }>({
    open: false,
    row: null,
  });
  const [reviewStatus, setReviewStatus] = React.useState<string>("");
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);

  // PDF export
  const [exportingPdf, setExportingPdf] = React.useState(false);

  // ── Load timetables ────────────────────────────────────────────────────────
  React.useEffect(() => {
    axios
      .get("/api/schedules/timetables/")
      .then((r) => {
        const list: Timetable[] = r.data.data.map((t: any) => ({
          id: t.id,
          label: `${t.location?.name ?? "–"} | ${t.academic_year} | ${t.semester?.name} (${t.category})`,
        }));
        setTimetables(list);
        if (list.length > 0) setSelectedTimetable(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  // ── Load stats when timetable changes ─────────────────────────────────────
  React.useEffect(() => {
    if (!selectedTimetable) return;
    setLoadingStats(true);
    setSelectedCourse(null);
    setCourseAttendance(null);
    axios
      .get(`/api/report/attendance/stats/?timetable_id=${selectedTimetable}`)
      .then((r) => {
        setStats(r.data.stats);
        setCourses(r.data.courses); // ← now "courses" not "exams"
      })
      .catch(() =>
        setToastMessage({ message: "Failed to load stats", variant: "danger" }),
      )
      .finally(() => setLoadingStats(false));
  }, [selectedTimetable]);

  // ── Drill into course ──────────────────────────────────────────────────────
  const openCourse = async (course: CourseSummary) => {
    setSelectedCourse(course);
    setLoadingAttendance(true);
    setCourseAttendance(null);
    setGlobalFilter("");
    setFilterCheated(false);
    try {
      const r = await axios.get(
        `/api/report/attendance/?course_code=${encodeURIComponent(course.course_code)}&timetable_id=${selectedTimetable}`,
      );
      setCourseAttendance(r.data);
    } catch {
      setToastMessage({
        message: "Failed to load attendance",
        variant: "danger",
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ── Export PDF (whole timetable or filtered to course) ─────────────────────
  const exportPdf = async () => {
    setExportingPdf(true);
    try {
      const courseParam = selectedCourse
        ? `&course_code=${encodeURIComponent(selectedCourse.course_code)}`
        : "";
      const r = await axios.get(
        `/api/report/attendance/pdf/?timetable_id=${selectedTimetable}${courseParam}`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement("a");
      link.href = url;
      const suffix = selectedCourse ? `_${selectedCourse.course_code}` : "";
      link.setAttribute(
        "download",
        `attendance${suffix}_${selectedTimetable}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToastMessage({ message: "PDF export failed", variant: "danger" });
    } finally {
      setExportingPdf(false);
    }
  };

  // ── Submit review action ───────────────────────────────────────────────────
  const submitReview = async () => {
    const report = reviewDialog.row?.cheating_report;
    if (!report) return;
    setSubmittingReview(true);
    try {
      await axios.patch(`/api/report/cheating/${report.id}/action/`, {
        status: reviewStatus || report.status,
        admin_notes: reviewNotes,
      });
      setToastMessage({
        message: "Report updated successfully",
        variant: "success",
      });
      setReviewDialog({ open: false, row: null });
      if (selectedCourse) openCourse(selectedCourse); // refresh
    } catch {
      setToastMessage({
        message: "Failed to update report",
        variant: "danger",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Table columns (shared across all exam sections) ────────────────────────
  const columns: ColumnDef<StudentRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "reg_no",
        header: "Reg No",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.getValue("reg_no")}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Student Name",
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.getValue("department")}
          </span>
        ),
      },
      {
        accessorKey: "room",
        header: "Room",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.getValue("room")}
          </span>
        ),
      },

      {
        accessorKey: "group",
        header: "Group",
        cell: ({ row }) => (
          <span className="text-xs font-medium">
            {row.getValue("group") ?? "–"}
          </span>
        ),
      },

      {
        accessorKey: "signin",
        header: "Sign-In",
        cell: ({ row }) =>
          row.getValue("signin") ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
          ),
      },
      {
        accessorKey: "signout",
        header: "Sign-Out",
        cell: ({ row }) =>
          row.getValue("signout") ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
          ),
      },
      {
        accessorKey: "cheated",
        header: "Cheated",
        cell: ({ row }) => {
          const cheated = row.getValue("cheated") as boolean;
          const report = row.original.cheating_report;
          if (!cheated)
            return (
              <span className="text-xs text-muted-foreground mx-auto block text-center">
                –
              </span>
            );
          const sev = SEVERITY_CONFIG[report?.severity ?? "low"];
          return (
            <div className="flex justify-center">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sev.color}`}
              >
                {sev.label}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Report Status",
        cell: ({ row }) => {
          const report = row.original.cheating_report;
          if (!report)
            return (
              <span className="text-xs text-muted-foreground block text-center">
                –
              </span>
            );
          const cfg = REPORT_STATUS_CONFIG[report.status];
          const Icon = cfg.icon;
          return (
            <div className="flex justify-center">
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.color}`}
              >
                <Icon className="h-3 w-3" /> {cfg.label}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const report = row.original.cheating_report;
          if (!report) return null;
          return (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => {
                setReviewDialog({ open: true, row: row.original });
                setReviewStatus(report.status);
                setReviewNotes("");
              }}
            >
              <Shield className="h-3 w-3" /> Review
            </Button>
          );
        },
      },
    ],
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6 p-1">
      {/* ── Header & Timetable selector ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance & Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor exam attendance and cheating incidents
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {/* PDF export — visible on both views */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={exportPdf}
            disabled={exportingPdf || loadingStats || !selectedTimetable}
          >
            {exportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {selectedCourse ? "Export Course PDF" : "Export All PDF"}
          </Button>

          <Select
            value={selectedTimetable}
            onValueChange={setSelectedTimetable}
          >
            <SelectTrigger className="w-[340px]">
              <SelectValue placeholder="Select timetable…" />
            </SelectTrigger>
            <SelectContent>
              {timetables.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedTimetable((v) => v)}
            disabled={loadingStats}
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingStats ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Total Students"
            value={stats.total_students}
            icon={Users}
            color="bg-blue-50  text-blue-800  border-blue-200"
          />
          <StatCard
            label="Signed In"
            value={stats.signed_in}
            icon={UserCheck}
            color="bg-green-50 text-green-800 border-green-200"
            sub={`${Math.round((stats.signed_in / (stats.total_students || 1)) * 100)}% attendance`}
          />
          <StatCard
            label="Signed Out"
            value={stats.signed_out}
            icon={UserCheck}
            color="bg-teal-50  text-teal-800  border-teal-200"
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            icon={UserX}
            color="bg-red-50   text-red-800   border-red-200"
          />
          <StatCard
            label="Cheating Reports"
            value={stats.cheating_reports}
            icon={ShieldAlert}
            color="bg-amber-50 text-amber-800 border-amber-200"
          />
        </div>
      )}

      {loadingStats && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* ── Course Grid OR Course Detail ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── Course Cards Grid ───────────────────────────────────────────── */}
        {!selectedCourse ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {courses.length > 0 && (
              <>
                <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  {courses.length} Course{courses.length !== 1 ? "s" : ""} —
                  Click to view attendance
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.course_code}
                      course={course}
                      onClick={() => openCourse(course)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          /* ── Course Detail View ─────────────────────────────────────────── */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Back + header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCourse(null);
                  setCourseAttendance(null);
                }}
                className="w-fit gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Courses
              </Button>
              <div className="sm:ml-2">
                <h2 className="font-bold text-lg">
                  {selectedCourse.course_code} – {selectedCourse.course_title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedCourse.exams.length} exam
                  {selectedCourse.exams.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Course-level summary cards */}
            {courseAttendance && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {[
                  {
                    label: "Total",
                    val: courseAttendance.summary.total,
                    color: "bg-slate-100",
                  },
                  {
                    label: "Present",
                    val: courseAttendance.summary.signed_in,
                    color: "bg-green-50 text-green-800",
                  },
                  {
                    label: "Absent",
                    val: courseAttendance.summary.absent,
                    color: "bg-red-50 text-red-700",
                  },
                  {
                    label: "Signed Out",
                    val: courseAttendance.summary.signed_out,
                    color: "bg-teal-50 text-teal-700",
                  },
                  {
                    label: "Cheating",
                    val: courseAttendance.summary.cheating_reports,
                    color: "bg-amber-50 text-amber-700",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className={`rounded-lg border px-4 py-3 text-center ${c.color}`}
                  >
                    <p className="text-xl font-bold">{c.val}</p>
                    <p className="text-xs font-medium">{c.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student, reg no…"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={filterCheated ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={() => setFilterCheated((v) => !v)}
              >
                <AlertTriangle className="h-4 w-4" />
                {filterCheated ? "All Students" : "Cheating Only"}
              </Button>
            </div>

            {loadingAttendance ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : courseAttendance ? (
              <div className="space-y-4">
                {courseAttendance ? (
                  <FlatAttendanceTable
                    rows={flatRows}
                    columns={columns}
                    filterCheated={filterCheated}
                    globalFilter={globalFilter}
                  />
                ) : null}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(o) => !o && setReviewDialog({ open: false, row: null })}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Review Cheating Report
            </DialogTitle>
            {reviewDialog.row && (
              <DialogDescription>
                Student:{" "}
                <span className="font-semibold text-foreground">
                  {reviewDialog.row.name}
                </span>{" "}
                ({reviewDialog.row.reg_no})
              </DialogDescription>
            )}
          </DialogHeader>

          {reviewDialog.row?.cheating_report && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Severity</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_CONFIG[reviewDialog.row.cheating_report.severity].color}`}
                  >
                    {
                      SEVERITY_CONFIG[reviewDialog.row.cheating_report.severity]
                        .label
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reported by</span>
                  <span className="font-medium">
                    {reviewDialog.row.cheating_report.reported_by}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Evidence files</span>
                  <span className="font-medium">
                    {reviewDialog.row.cheating_report.evidence_count}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">
                    Incident description
                  </p>
                  <p className="text-xs leading-relaxed bg-white rounded p-2 border">
                    {reviewDialog.row.cheating_report.incident_description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" /> Pending
                      </span>
                    </SelectItem>
                    <SelectItem value="under_review">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" /> Under Review
                      </span>
                    </SelectItem>
                    <SelectItem value="confirmed">
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-500" /> Confirm
                        Cheating
                      </span>
                    </SelectItem>
                    <SelectItem value="dismissed">
                      <span className="flex items-center gap-2">
                        <ShieldX className="h-4 w-4 text-green-600" /> Dismiss
                        Report
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about your decision…"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog({ open: false, row: null })}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              Save Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
