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
  ChevronDown, Loader2, MoreHorizontal, AlertTriangle,
  X, Upload, Download, Users, UserCheck, UserX,
  MapPin, Building2, BookOpen, Clock,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import useToast from "../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
export type StudentExam = {
  id: string;
  student_id: string;
  user_id: number;
  exam_id: string;
  reg_no: string;
  name: string;
  faculity: string;
  exam: string;
  signin: boolean;
  signout: boolean;
  room: string | null;
  campus: string | null;
};

type CheatingReportForm = {
  incident_description: string;
  severity: "low" | "medium" | "high";
  incident_time: string;
  evidence_file: File | null;
  evidence_description: string;
};

const EMPTY_FORM: CheatingReportForm = {
  incident_description: "",
  severity: "medium",
  incident_time: "",
  evidence_file: null,
  evidence_description: "",
};

// ── Mini Stat Card ─────────────────────────────────────────────────────────────
function MiniStat({
  label, value, icon: Icon, colorClass, delay = 0,
}: {
  label: string; value: number | string; icon: any; colorClass: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colorClass}`}
    >
      <div className="rounded-lg p-1.5 bg-white/50">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function InstructorAllocationsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<StudentExam[]>([]);
  const { setToastMessage } = useToast();
  const [isMarkingAttendance, setIsMarkingAttendance] = React.useState(false);
  const [assignedRoom, setAssignedRoom] = React.useState<string | null>(null);
  const [assignedCampus, setAssignedCampus] = React.useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = React.useState(false);

  // ── Cheating report state ──────────────────────────────────────────────────
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentExam | null>(null);
  const [reportForm, setReportForm] = React.useState<CheatingReportForm>(EMPTY_FORM);
  const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pageIndexRef = React.useRef(0);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    const total     = data.length;
    const signedIn  = data.filter((d) => d.signin).length;
    const signedOut = data.filter((d) => d.signout).length;
    const absent    = total - signedIn;
    return { total, signedIn, signedOut, absent };
  }, [data]);

  // ── Unique exams in session ────────────────────────────────────────────────
  const uniqueExams = React.useMemo(
    () => [...new Set(data.map((d) => d.exam).filter(Boolean))],
    [data]
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchExams = (url: string | null) => {
    startTransition(async () => {
      try {
        const resp = await axios.request({
          url: url ?? "/api/exams/student-exam/instructor_student_exams",
          method: "get",
          baseURL: undefined,
        });

        const formattedData = resp.data.students.map((d: any) => ({
          id: d.id,
          student_id: d.student.id,
          user_id: d.student.user.id,
          exam_id: d.exam.id,
          reg_no: d.student.reg_no,
          name: d.student.user.first_name + " " + d.student.user.last_name,
          faculity: d.student.department.name,
          exam: d.exam?.group?.course?.title,
          signin: d?.signin_attendance,
          signout: d?.signout_attendance,
          room: d.room?.name,
          campus: d.room?.location?.name,
        }));

        if (formattedData.length > 0) {
          setAssignedRoom(formattedData[0].room);
          setAssignedCampus(formattedData[0].campus);
        }
        setData(formattedData);
      } catch (error) {
        if (error && typeof error === "object" && error !== null) {
          const err = error as { name?: string; code?: string; message?: string };
          if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
            setError(err.message || "Failed to load data. Please try again.");
          }
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  // ── PDF export ─────────────────────────────────────────────────────────────
  const exportPdf = async () => {
    setExportingPdf(true);
    try {
      const examId = data[0]?.exam_id;
      const r = await axios.get(
        `/api/report/attendance/instructor-pdf/?exam_id=${examId}`,
        { responseType: "blob" }
      );
      const url  = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute(
        "download",
        `attendance_${assignedRoom ?? "report"}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage({ message: "PDF exported successfully", variant: "success" });
    } catch {
      setToastMessage({ message: "Failed to export PDF", variant: "danger" });
    } finally {
      setExportingPdf(false);
    }
  };

  // ── Attendance actions ─────────────────────────────────────────────────────
  const signinStudent = async (student_id: string, exam_id: string, checked: boolean) => {
    const savedPage = pageIndexRef.current;
    try {
      setIsMarkingAttendance(true);
      const resp = await axios.patch("/api/exams/exams/student_signin", { student_id, exam_id });
      if (resp.data.success) {
        setData((prev) =>
          prev.map((item) =>
            item.student_id === student_id && item.exam_id === exam_id
              ? { ...item, signin: checked }
              : item
          )
        );
        requestAnimationFrame(() => table.setPageIndex(savedPage));
        setToastMessage({ message: "Attendance marked successfully", variant: "success" });
      }
    } catch {
      setToastMessage({ message: "Failed to mark attendance", variant: "danger" });
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const signoutStudent = async (student_id: string, exam_id: string, checked: boolean) => {
    const savedPage = pageIndexRef.current;
    try {
      setIsMarkingAttendance(true);
      const resp = await axios.patch("/api/exams/exams/student_signout", { student_id, exam_id });
      if (resp.data.success) {
        setData((prev) =>
          prev.map((item) =>
            item.student_id === student_id && item.exam_id === exam_id
              ? { ...item, signout: checked }
              : item
          )
        );
        requestAnimationFrame(() => table.setPageIndex(savedPage));
        setToastMessage({ message: "Attendance marked successfully", variant: "success" });
      }
    } catch {
      setToastMessage({ message: "Failed to mark attendance", variant: "danger" });
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  // ── Cheating report ────────────────────────────────────────────────────────
  const openReportDialog = (student: StudentExam) => {
    setSelectedStudent(student);
    setReportForm({ ...EMPTY_FORM, incident_time: new Date().toISOString().slice(0, 16) });
    setReportDialogOpen(true);
  };

  const closeReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedStudent(null);
    setReportForm(EMPTY_FORM);
  };

  const submitCheatingReport = async () => {
    if (!selectedStudent) return;
    if (!reportForm.incident_description.trim()) {
      setToastMessage({ message: "Please describe the incident.", variant: "danger" });
      return;
    }
    try {
      setIsSubmittingReport(true);
      const reportResp = await axios.post("/api/report/cheating-reports/mine/", {
        exam: selectedStudent.exam_id,
        student: selectedStudent.user_id,
        incident_description: reportForm.incident_description,
        severity: reportForm.severity,
        incident_time: reportForm.incident_time || undefined,
      });
      const reportId = reportResp.data.id;
      if (reportForm.evidence_file) {
        const formData = new FormData();
        formData.append("file", reportForm.evidence_file);
        formData.append("evidence_type", "document");
        formData.append("description", reportForm.evidence_description);
        await axios.post(`/api/report/cheating-reports/${reportId}/evidence/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setToastMessage({ message: `Cheating report filed for ${selectedStudent.name}`, variant: "success" });
      closeReportDialog();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.student?.[0] || "Failed to submit report.";
      setToastMessage({ message: msg, variant: "danger" });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<StudentExam>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: "reg_no",
      header: "Reg Number",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("reg_no")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "faculity",
      header: "Faculty",
      cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.getValue("faculity")}</div>,
    },
    {
      accessorKey: "exam",
      header: "Exam",
      cell: ({ row }) => <div className="text-xs">{row.getValue("exam")}</div>,
    },
    {
      accessorKey: "signin",
      header: () => <div className="text-center">Sign In</div>,
      cell: ({ row }) => {
        const isSignedIn = row.getValue("signin") as boolean;
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={isSignedIn}
              className="h-8 w-8 border border-primary"
              onCheckedChange={(checked) => {
                if (typeof checked === "boolean")
                  signinStudent(row.original.student_id, row.original.exam_id, checked);
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "signout",
      header: () => <div className="text-center">Sign Out</div>,
      cell: ({ row }) => {
        const isSignedOut = row.getValue("signout") as boolean;
        const isSignedIn  = row.getValue("signin") as boolean;
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={isSignedOut}
              className="h-8 w-8 border"
              onCheckedChange={(checked) => {
                if (!isSignedIn) {
                  setToastMessage({ message: "Student must sign in first.", variant: "danger" });
                  return;
                }
                if (typeof checked === "boolean")
                  signoutStudent(row.original.student_id, row.original.exam_id, checked);
              }}
            />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => openReportDialog(row.original)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Report Cheating
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false, enableHiding: false,
    },
  ];

  const table = useReactTable({
    data, columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    globalFilterFn: (row, _, filterValue) => {
      const q = filterValue.toLowerCase();
      return [row.original.reg_no, row.original.name, row.original.faculity, row.original.exam]
        .some((v) => (v || "").toLowerCase().includes(q));
    },
  });

  React.useEffect(() => { fetchExams(null); }, []);
  React.useEffect(() => {
    pageIndexRef.current = table.getState().pagination.pageIndex;
  }, [table.getState().pagination.pageIndex]);

  if (isLoading) return <TableSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button variant="outline" onClick={() => fetchExams(null)}>Retry</Button>
    </div>
  );

  const now = new Date();

  return (
    <div className="w-full flex flex-col gap-4 p-4">

      {/* ── Dashboard Header ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-muted/30 p-5 space-y-4">

        {/* Top row: date + location info + export */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </motion.h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {assignedRoom && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Room: {assignedRoom}
                </span>
              )}
              {assignedCampus && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {assignedCampus}
                </span>
              )}
            </div>
            {/* Exams in session */}
            {uniqueExams.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {uniqueExams.map((exam) => (
                  <Badge key={exam} variant="secondary" className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" /> {exam}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Export PDF button */}
          <Button
            onClick={exportPdf}
            disabled={exportingPdf || data.length === 0}
            className="gap-2 shrink-0 self-start"
            size="sm"
          >
            {exportingPdf
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />}
            Export Attendance PDF
          </Button>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Total Students" value={stats.total}    icon={Users}      colorClass="bg-blue-50  text-blue-800  border-blue-200"  delay={0} />
          <MiniStat label="Signed In"      value={stats.signedIn} icon={UserCheck}  colorClass="bg-green-50 text-green-800 border-green-200" delay={0.05} />
          <MiniStat label="Signed Out"     value={stats.signedOut}icon={UserCheck}  colorClass="bg-teal-50  text-teal-800  border-teal-200"  delay={0.1} />
          <MiniStat label="Absent"         value={stats.absent}   icon={UserX}      colorClass="bg-red-50   text-red-800   border-red-200"   delay={0.15} />
        </div>

        {/* Attendance progress bar */}
        {stats.total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Attendance Progress</span>
              <span className="font-semibold text-foreground">
                {Math.round((stats.signedIn / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.signedIn / stats.total) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {isMarkingAttendance && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating attendance…
          </div>
        )}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name, reg no, faculty…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className={
                    row.original.signin
                      ? "hover:bg-muted/40"
                      : "bg-red-50/30 hover:bg-red-50/50"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="text-xs">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* ── Cheating Report Dialog ─────────────────────────────────────────── */}
      <Dialog open={reportDialogOpen} onOpenChange={(open) => !open && closeReportDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Report Cheating Incident
            </DialogTitle>
            {selectedStudent && (
              <DialogDescription>
                Filing a report against{" "}
                <span className="font-semibold text-foreground">{selectedStudent.name}</span>
                {" "}({selectedStudent.reg_no}) — {selectedStudent.exam}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={reportForm.severity}
                onValueChange={(val) => setReportForm((f) => ({ ...f, severity: val as CheatingReportForm["severity"] }))}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" /> Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-400 inline-block" /> Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="incident_time">Incident Time</Label>
              <Input
                id="incident_time"
                type="datetime-local"
                value={reportForm.incident_time}
                onChange={(e) => setReportForm((f) => ({ ...f, incident_time: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Incident Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened in detail..."
                rows={4}
                value={reportForm.incident_description}
                onChange={(e) => setReportForm((f) => ({ ...f, incident_description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Evidence (optional)</Label>
              <div
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {reportForm.evidence_file ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{reportForm.evidence_file.name}</span>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setReportForm((f) => ({ ...f, evidence_file: null })); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Click to upload image or document</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef} type="file" className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setReportForm((f) => ({ ...f, evidence_file: e.target.files?.[0] ?? null }))}
              />
              {reportForm.evidence_file && (
                <Input
                  placeholder="Describe this evidence (optional)"
                  value={reportForm.evidence_description}
                  onChange={(e) => setReportForm((f) => ({ ...f, evidence_description: e.target.value }))}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReportDialog} disabled={isSubmittingReport}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={submitCheatingReport}
              disabled={isSubmittingReport || !reportForm.incident_description.trim()}
            >
              {isSubmittingReport
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                : <><AlertTriangle className="mr-2 h-4 w-4" /> Submit Report</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
