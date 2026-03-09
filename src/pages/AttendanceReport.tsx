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
  FileText,
  Image as ImageIcon,
  File,
  ExternalLink,
  ZoomIn,
  X,
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

type Evidence = {
  evidence_type: string;
  description: string;
  url: string;
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
  evidences: Evidence[];
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

/** Detect file type from Cloudinary URL or evidence_type */
function detectFileType(
  url: string,
  evidenceType: string,
): "image" | "pdf" | "doc" | "other" {
  const lower = url.toLowerCase();
  if (
    evidenceType === "image" ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/.test(lower)
  )
    return "image";
  if (/\.pdf(\?|$)/.test(lower) || evidenceType === "document") return "pdf";
  if (/\.(doc|docx)(\?|$)/.test(lower)) return "doc";
  return "other";
}

/** Build a Cloudinary thumbnail URL from a full resource URL */
function cloudinaryThumb(url: string, w = 300, h = 200): string {
  // Insert transformation before /upload/
  return url.replace("/upload/", `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);
}

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

// ══════════════════════════════════════════════════════════════════════════════
//  EVIDENCE GALLERY COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function EvidenceGallery({ evidences }: { evidences: Evidence[] }) {
  const [lightbox, setLightbox] = React.useState<Evidence | null>(null);

  if (!evidences || evidences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2 rounded-lg bg-muted/30 border border-dashed">
        <File className="h-8 w-8 opacity-40" />
        <p className="text-xs">No evidence attached</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {evidences.map((ev, idx) => {
          const type = detectFileType(ev.url, ev.evidence_type);
          return (
            <EvidenceCard
              key={idx}
              evidence={ev}
              type={type}
              onPreview={() => setLightbox(ev)}
            />
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {lightbox.description || "Evidence"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {lightbox.evidence_type}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={lightbox.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setLightbox(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lightbox body */}
              <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-muted/10 p-4">
                <LightboxContent evidence={lightbox} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Single evidence card ───────────────────────────────────────────────────────
function EvidenceCard({
  evidence,
  type,
  onPreview,
}: {
  evidence: Evidence;
  type: "image" | "pdf" | "doc" | "other";
  onPreview: () => void;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
      className="group relative rounded-xl border bg-card overflow-hidden cursor-pointer transition-all"
      onClick={onPreview}
    >
      {/* Thumbnail area */}
      <div className="relative h-28 bg-muted/40 flex items-center justify-center overflow-hidden">
        {type === "image" && !imgError ? (
          <>
            <img
              src={cloudinaryThumb(evidence.url)}
              alt={evidence.description || "Evidence"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : type === "pdf" ? (
          <div className="flex flex-col items-center gap-1 text-red-500">
            <FileText className="h-10 w-10" />
            <span className="text-xs font-semibold">PDF</span>
          </div>
        ) : type === "doc" ? (
          <div className="flex flex-col items-center gap-1 text-blue-600">
            <FileText className="h-10 w-10" />
            <span className="text-xs font-semibold">DOC</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <File className="h-10 w-10" />
            <span className="text-xs font-semibold">FILE</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-1.5 left-1.5">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              type === "image"
                ? "bg-purple-100 text-purple-700"
                : type === "pdf"
                  ? "bg-red-100 text-red-700"
                  : type === "doc"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium truncate leading-snug">
          {evidence.description || "No description"}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground capitalize">
            {evidence.evidence_type}
          </span>
          <a
            href={evidence.url}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            <Download className="h-2.5 w-2.5" /> Save
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Lightbox content based on type ────────────────────────────────────────────
function LightboxContent({ evidence }: { evidence: Evidence }) {
  const type = detectFileType(evidence.url, evidence.evidence_type);

  if (type === "image") {
    return (
      <img
        src={evidence.url}
        alt={evidence.description || "Evidence"}
        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow"
      />
    );
  }

  if (type === "pdf") {
    return (
      <div className="w-full h-[60vh]">
        <iframe
          src={`${evidence.url}#toolbar=0`}
          className="w-full h-full rounded-lg border"
          title={evidence.description || "PDF Evidence"}
        />
      </div>
    );
  }

  // doc / other — can't preview inline, show download prompt
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
      <div>
        <p className="font-semibold">Preview not available</p>
        <p className="text-sm text-muted-foreground mt-1">
          This file type cannot be previewed in the browser.
        </p>
      </div>
      <a
        href={evidence.url}
        download
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
      >
        <Download className="h-4 w-4" /> Download to view
      </a>
    </div>
  );
}

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
      <div className="flex items-center justify-between">
        <SummaryPills
          total={course.total}
          signed_in={course.signed_in}
          absent={course.absent}
          cheating_reports={course.cheating_reports}
        />
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
      </div>
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

// ── Main Component ─────────────────────────────────────────────────────────────
export function AttendanceReport() {
  const axios = useUserAxios();
  const { setToastMessage } = useToast();

  const [timetables, setTimetables] = React.useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = React.useState<string>("");
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [courses, setCourses] = React.useState<CourseSummary[]>([]);
  const [courseSearchQuery, setCourseSearchQuery] = React.useState<string>("");
  const filteredCourses = React.useMemo<CourseSummary[]>(() => {
    return courses.filter(
      (c) =>
        c.course_code.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
        c.course_title.toLowerCase().includes(courseSearchQuery.toLowerCase()),
    );
  }, [courseSearchQuery, courses]);
  const [loadingStats, setLoadingStats] = React.useState(false);

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

    const[attendanceFilter, setAttendanceFilter]= React.useState<"all"| "cheated"| "signed_out" |"present" | "absent">("all");
  const filteredAttendance= React.useMemo(()=>{
    switch(attendanceFilter){
      case "cheated":
        return flatRows.filter((s) => s.cheated);
      case "signed_out":
        return flatRows.filter((s) => !s.signin && s.signout);
      case "present":
        return flatRows.filter((s) => s.signin && s.signout);
      case "absent":
        return flatRows.filter((s) => !s.signin && !s.cheated);
      default:
        return flatRows;
    }


  },[flatRows, attendanceFilter])

  const [reviewDialog, setReviewDialog] = React.useState<{
    open: boolean;
    row: StudentRow | null;
  }>({ open: false, row: null });
  const [reviewStatus, setReviewStatus] = React.useState<string>("");
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);

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

  React.useEffect(() => {
    if (!selectedTimetable) return;
    setLoadingStats(true);
    setSelectedCourse(null);
    setCourseAttendance(null);
    axios
      .get(`/api/report/attendance/stats/?timetable_id=${selectedTimetable}`)
      .then((r) => {
        setStats(r.data.stats);
        setCourses(r.data.courses);
      })
      .catch(() =>
        setToastMessage({ message: "Failed to load stats", variant: "danger" }),
      )
      .finally(() => setLoadingStats(false));
  }, [selectedTimetable]);

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
      link.setAttribute(
        "download",
        `attendance${selectedCourse ? `_${selectedCourse.course_code}` : ""}_${selectedTimetable}.pdf`,
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
      if (selectedCourse) openCourse(selectedCourse);
    } catch {
      setToastMessage({
        message: "Failed to update report",
        variant: "danger",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

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

  return (
    <div className="w-full space-y-6 p-1">
      {/* Header */}
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
            <SelectTrigger className="w-[300px]">
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

      {/* Stats */}
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

      {/* Course grid / detail */}
      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredCourses.length > 0 && (
              <>
                <div className="relative flex-1 min-w-[200px] max-w-sm py-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search course title, course code"
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  {filteredCourses.length} Course
                  {filteredCourses.length !== 1 ? "s" : ""} — Click to view
                  attendance
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => (
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
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
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

            {courseAttendance && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {[
                  {
                    label: "Total",
                    val: courseAttendance.summary.total,
                    color: "bg-slate-100",
                    filter: "all" as const,
                  },
                  {
                    label: "Present",
                    val: courseAttendance.summary.signed_in,
                    color: "bg-green-50 text-green-800",
                    filter: "present" as const,
                  },
                  {
                    label: "Absent",
                    val: courseAttendance.summary.absent,
                    color: "bg-red-50 text-red-700",
                    filter: "absent" as const,
                  },
                  {
                    label: "Signed Out",
                    val: courseAttendance.summary.signed_out,
                    color: "bg-teal-50 text-teal-700",
                    filter: "signed_out" as const,
                  },
                  {
                    label: "Cheating",
                    val: courseAttendance.summary.cheating_reports,
                    color: "bg-amber-50 text-amber-700",
                    filter: "cheated" as const,
                  },
                ].map((c) => (
                  <Button
                    key={c.label}
                    className={`rounded-lg border px-4 py-3 text-center ${c.color}`}
                    onClick={() => setAttendanceFilter(c.filter)}
                  >
                    <p className="text-xl font-bold">{c.val}</p>
                    <p className="text-xs font-medium">{c.label}</p>
                  </Button>
                ))}
              </div>
            )}

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
              <FlatAttendanceTable
                rows={filteredAttendance}
                columns={columns}
                filterCheated={filterCheated}
                globalFilter={globalFilter}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(o) => !o && setReviewDialog({ open: false, row: null })}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
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
              {/* Incident meta */}
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
                <div>
                  <p className="text-muted-foreground mb-1">
                    Incident description
                  </p>
                  <p className="text-xs leading-relaxed bg-white dark:bg-muted rounded p-2 border">
                    {reviewDialog.row.cheating_report.incident_description}
                  </p>
                </div>
              </div>

              {/* ── Evidence Gallery ───────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Evidence
                    {reviewDialog.row.cheating_report.evidence_count > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        {reviewDialog.row.cheating_report.evidence_count}
                      </Badge>
                    )}
                  </Label>
                </div>
                <EvidenceGallery
                  evidences={reviewDialog.row.cheating_report.evidences}
                />
              </div>

              {/* Action */}
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
