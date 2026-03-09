import * as React from "react"
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
} from "@tanstack/react-table"

import { ChevronDown, Download, Loader2, QrCode } from "lucide-react"

import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import QRCode from "react-qr-code";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import useUser from "../hooks/useUser"
import { StatusButton } from "../components/ui/status-button"
import { useEffect, useRef, useState } from "react"
import useUserAxios from "../hooks/useUserAxios"

interface Department {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  code: string;
  name: string;
}

interface Semester {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor: string;
  department: Department;
  semester: Semester;
  prerequisites: any[];
  start_date: string;
  end_date: string;
  enrollment_limit: number;
  schedules: any[];
  students_enrolled: number;
}

export interface Exam {
  id: string;
  course: Course;
  start_time: string;
  end_time: string;
  date: string;
  room: Room | null;
  status: string;
}

interface Student {
  id: number;
  user: string;
  reg_no: string;
  department: Department;
}

export interface Room {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  capacity: number;
}

interface ExamAllocation {
  id: number;
  student: Student;
  exam: Exam;
  room: Room;
  status: string;
}

export const columns: ColumnDef<Exam>[] = [
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },
  {
    accessorKey: "course_title",
    header: "Course",
    cell: ({ row }) => <div className="capitalize">{row.getValue("course_title")}</div>,
  },
  {
    accessorKey: "course_group",
    header: "Group",
    cell: ({ row }) => <div className="capitalize">{row.getValue("course_group")}</div>,
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => <div>{row.getValue("start_time")}</div>,
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => <div>{row.getValue("end_time")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusButton status={row.getValue("status")} />,
  },
]

interface StudentExamsProps {
  exams: Exam[];
}

interface CurrentStudent {
  user_id: number;
  email: string;
  key: string;
}

export default function StudentExams({ exams }: StudentExamsProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Exam | null>(null);
  const current_student: CurrentStudent = useUser();
  const [data, setData] = useState<Exam[]>([]);
  const [encryptedQrCodeData, setEncryptedQrCodeData] = useState<string>("");
  const [expiredTime, setExpiredTime] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const axios = useUserAxios();

  const getQrCodeExpirationTime = async () => {
    try {
      const resp = await axios.get("/api/exams/student-exam/time");
      if (resp.data.success) {
        setExpiredTime(resp.data.time);
      }
    } catch (error) {}
  };

  function base64UrlToBytes(base64Url: string): Uint8Array {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    return new Uint8Array(binary.split('').map(char => char.charCodeAt(0)));
  }

  async function encryptMessage(message: string): Promise<string> {
    const keyBytes = base64UrlToBytes(current_student.key);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, cryptoKey, encodedMessage
    );
    const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertextBuffer), iv.length);
    return btoa(String.fromCharCode(...combined))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const handleDownloadQr = () => {
    if (!qrRef.current || !selectedRow) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `exam-qr-${selectedRow.course.title.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

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
  });

  useEffect(() => {
    setData(exams);
  }, [exams]);

  useEffect(() => {
    const encryptData = async () => {
      if (selectedRow && current_student && expiredTime) {
        setIsGeneratingQr(true);
        try {
          const encryptedData = await encryptMessage(JSON.stringify({
            studentId: current_student.user_id,
            studentEmail: current_student.email,
            examId: selectedRow.id,
            courseId: selectedRow.course.id,
            expirationTime: expiredTime,
          }));
          setEncryptedQrCodeData(encryptedData);
        } catch (error) {
          setEncryptedQrCodeData("");
        } finally {
          setIsGeneratingQr(false);
        }
      }
    };
    encryptData();
  }, [selectedRow, expiredTime]);

  useEffect(() => {
    if (selectedRow) {
      setEncryptedQrCodeData("");
      getQrCodeExpirationTime();
    }
  }, [selectedRow]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="w-full space-y-4">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Input
            placeholder="Filter Exams..."
            value={(table.getColumn("course_title")?.getFilterValue() as string) ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              table.getColumn("course_title")?.setFilterValue(event.target.value)
            }
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
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={async () => {
                      setSelectedRow(row.original);
                      setDialogOpen(true);
                    }}
                    className="cursor-pointer"
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
      </div>

      <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-base font-semibold">
            Exam QR Code
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            Present this QR code at the exam venue for check-in.
          </DialogDescription>
        </DialogHeader>

        {selectedRow && (
          <div className="flex flex-col items-center gap-5 pt-2 pb-4">
            {/* Course label */}
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">{selectedRow.course.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedRow.date} · {selectedRow.start_time} – {selectedRow.end_time}
              </p>
            </div>

            {/* QR code area */}
            <div className="w-full flex items-center justify-center bg-white rounded-2xl p-6 shadow-sm border border-border/60">
              {isGeneratingQr || !encryptedQrCodeData ? (
                <div className="flex flex-col items-center justify-center gap-3 h-56 w-56">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Generating QR code…</span>
                </div>
              ) : (
                <div ref={qrRef} className="w-56 h-56">
                  <QRCode
                    size={224}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={encryptedQrCodeData}
                    viewBox="0 0 256 256"
                    level="M"
                  />
                </div>
              )}
            </div>

            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={handleDownloadQr}
              disabled={isGeneratingQr || !encryptedQrCodeData}
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}