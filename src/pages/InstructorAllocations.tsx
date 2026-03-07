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

import { ChevronDown, Loader2, MoreHorizontal, AlertTriangle, X, Upload } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import TableSkeleton from "../components/TableSkeleton";
import useToast from "../hooks/useToast";
import { motion } from "framer-motion";
import { Badge } from "../components/ui/badge";

export type StudentExam = {
  id: string;
  student_id: string;
  exam_id: string;
  reg_no: string;
  name: string;
  faculity: string;
  exam: string;
  signin: boolean;
  signout: boolean;
  room: string | null;
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
  const [room, setRoom] = React.useState<string | null>(null);
  const { setToastMessage } = useToast();
  const [isMarkingAttendance, setIsMarkingAttendance] = React.useState(false);

  // ── Cheating report state ──────────────────────────────────────────────────
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentExam | null>(null);
  const [reportForm, setReportForm] = React.useState<CheatingReportForm>(EMPTY_FORM);
  const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Stable page index ref — fixes page reset after checkbox update ─────────
  const pageIndexRef = React.useRef(0);

  const fetchExams = (url: string | null) => {
    startTransition(async () => {
      try {
        const resp = await axios.request({
          url: url ?? "/api/exams/student-exam/instructor_student_exams",
          method: "get",
          baseURL: undefined,
        });

        const formattedData = resp.data.students.map((data: any) => ({
          id: data.id,
          student_id: data.student.id,
          exam_id: data.exam.id,
          reg_no: data.student.reg_no,
          name: data.student.user.first_name + " " + data.student.user.last_name,
          faculity: data.student.department.name,
          exam: data.exam?.group?.course?.title,
          signin: data?.signin_attendance,
          signout: data?.signout_attendance,
          room: data.exam?.room?.room_name,
        }));

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
        // Restore page after state update
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

  // ── Submit cheating report ─────────────────────────────────────────────────
  const openReportDialog = (student: StudentExam) => {
    setSelectedStudent(student);
    setReportForm({
      ...EMPTY_FORM,
      // Pre-fill incident time with current datetime
      incident_time: new Date().toISOString().slice(0, 16),
    });
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

      // Step 1: Create the report
      const reportResp = await axios.post("/api/report/cheating-reports/mine/", {
        exam: selectedStudent.exam_id,
        student: selectedStudent.student_id,
        incident_description: reportForm.incident_description,
        severity: reportForm.severity,
        incident_time: reportForm.incident_time || undefined,
      });

      const reportId = reportResp.data.id;

      // Step 2: Upload evidence file if provided
      if (reportForm.evidence_file) {
        const formData = new FormData();
        formData.append("file", reportForm.evidence_file);
        formData.append("evidence_type", "document");
        formData.append("description", reportForm.evidence_description);

        await axios.post(`/api/report/cheating-reports/${reportId}/evidence/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setToastMessage({
        message: `Cheating report filed for ${selectedStudent.name}`,
        variant: "success",
      });
      closeReportDialog();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.student?.[0] ||
        "Failed to submit report. Please try again.";
      setToastMessage({ message: msg, variant: "danger" });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnDef<StudentExam>[] = [
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
      header: "Id",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "reg_no",
      header: "Reg Number",
      cell: ({ row }) => <div className="capitalize">{row.getValue("reg_no")}</div>,
    },
    {
      accessorKey: "name",
      header: () => <div className="text-right">Name</div>,
      cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "faculity",
      header: () => <div className="text-right">Faculty</div>,
      cell: ({ row }) => <div className="lowercase">{row.getValue("faculity")}</div>,
    },
    {
      accessorKey: "exam",
      header: () => <div className="text-right">Exam</div>,
      cell: ({ row }) => <div className="lowercase">{row.getValue("exam")}</div>,
    },
    {
      accessorKey: "signin",
      header: () => <div className="text-right">Signed in</div>,
      cell: ({ row }) => {
        const isSignedIn = row.getValue("signin") as boolean;
        const studentId = row.original.student_id;
        const examId = row.original.exam_id;
        return (
          <Checkbox
            checked={isSignedIn}
            className="h-8 w-8 border border-primary"
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                signinStudent(studentId, examId, checked);
              }
            }}
            // ✅ Removed disabled — instructor can toggle freely
          />
        );
      },
    },
    {
      accessorKey: "signout",
      header: () => <div className="text-right">Signed out</div>,
      cell: ({ row }) => {
        const isSignedOut = row.getValue("signout") as boolean;
        const isSignedIn = row.getValue("signin") as boolean;
        const studentId = row.original.student_id;
        const examId = row.original.exam_id;
        return (
          <Checkbox
            checked={isSignedOut}
            className="h-8 w-8 border"
            onCheckedChange={(checked) => {
              if (!isSignedIn) {
                setToastMessage({ message: "Student must sign in first.", variant: "danger" });
                return;
              }
              if (typeof checked === "boolean") {
                signoutStudent(studentId, examId, checked);
              }
            }}
            // ✅ Removed disabled — instructor can toggle freely
          />
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => openReportDialog(student)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Cheating
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

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
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return [row.original.reg_no, row.original.name, row.original.faculity, row.original.exam]
        .some((v) => (v || "").toLowerCase().includes(search));
    },
  });

  React.useEffect(() => {
    fetchExams(null);
  }, []);

  React.useEffect(() => {
    if (data.length > 0) setRoom(data[0]?.room);
  }, [data]);

  // Track page index in ref so sign-in/out handlers always have the latest value
  React.useEffect(() => {
    pageIndexRef.current = table.getState().pagination.pageIndex;
  }, [table.getState().pagination.pageIndex]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) return <TableSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button variant="outline" onClick={() => fetchExams(null)}>Retry</Button>
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        {isMarkingAttendance && <Loader2 className="h-5 w-5 animate-spin" />}
        <motion.h2
          key={new Date().getMonth()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl tracking-tighter font-bold"
        >
          {new Date().getDate()}{" "}
          {new Date().toLocaleString("default", { month: "long" })}{" "}
          {new Date().getFullYear()}
        </motion.h2>
        {room && <Badge variant="default">{room}</Badge>}
      </div>

      {/* Toolbar */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
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
            {/* Severity */}
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={reportForm.severity}
                onValueChange={(val) =>
                  setReportForm((f) => ({ ...f, severity: val as CheatingReportForm["severity"] }))
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-400 inline-block" />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incident time */}
            <div className="grid gap-2">
              <Label htmlFor="incident_time">Incident Time</Label>
              <Input
                id="incident_time"
                type="datetime-local"
                value={reportForm.incident_time}
                onChange={(e) => setReportForm((f) => ({ ...f, incident_time: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Incident Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened in detail..."
                rows={4}
                value={reportForm.incident_description}
                onChange={(e) =>
                  setReportForm((f) => ({ ...f, incident_description: e.target.value }))
                }
              />
            </div>

            {/* Evidence file */}
            <div className="grid gap-2">
              <Label>Evidence (optional)</Label>
              <div
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {reportForm.evidence_file ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{reportForm.evidence_file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportForm((f) => ({ ...f, evidence_file: null }));
                      }}
                    >
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
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setReportForm((f) => ({ ...f, evidence_file: file }));
                }}
              />
              {reportForm.evidence_file && (
                <Input
                  placeholder="Describe this evidence (optional)"
                  value={reportForm.evidence_description}
                  onChange={(e) =>
                    setReportForm((f) => ({ ...f, evidence_description: e.target.value }))
                  }
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReportDialog} disabled={isSubmittingReport}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitCheatingReport}
              disabled={isSubmittingReport || !reportForm.incident_description.trim()}
            >
              {isSubmittingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}