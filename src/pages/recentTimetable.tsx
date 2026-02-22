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
  Loader,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  PrinterCheckIcon,
  TrashIcon,
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { isAxiosError } from "axios";
import useExamsSchedule from "../hooks/useExamShedule";
import { get } from "http";

interface Timetable {
  id: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  generated_at: string;
  status: string;
  generated_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    password_strength: null | string;
  };
  published_at?: string;
}

export const columns: ColumnDef<Timetable>[] = [
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
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "academic_year",
    header: "Academic Year",
    cell: ({ row }) => <div>{row.getValue("academic_year")}</div>,
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("start_date")), "MMMM d, yyyy")}</div>
    ),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("end_date")), "MMMM d, yyyy")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "campus",
    header: "Campus",
    cell: ({ row }) => <div>{row.getValue("campus")}</div>,
  },
  {
    accessorKey: "generated_at",
    header: "Generated On",
    cell: ({ row }) => (
      <div>
        {format(
          new Date(row.getValue("generated_at")),
          "MMMM d, yyyy · h:mm a",
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusButton status={row.getValue("status")} />,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to={`/admin/exams?id=${row.getValue("id")}`}
        className="text-blue-600 underline"
      >
        View Exams
      </Link>
    ),
  },
];

export function TimeTablesPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isGettingExams, startTransition] = React.useTransition();
  const { setToastMessage, setServerLoadingMessage, serverLoadingMessage } =
    useToast();
  const [searchParams] = useSearchParams();
  const [isDeletingTimeTables, startDeletingTransition] = React.useTransition();
  const [showDialog, setShowDialog] = React.useState(false);
  const [dialogType, setShowDialogType] = React.useState<
    "configuration" | "confirmation" | null
  >(null);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = React.useState<
    null | number | string
  >(null);
  const { setExams, unScheduled, setStatus, status, masterTimetable } =
    useExamsSchedule();

  const [data, setData] = React.useState<Timetable[]>([]);

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
        pageSize: 7,
      },
    },
  });

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
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(
        new Blob([resp.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `exam_timetable_${timetableId}_${format(new Date(), "yyyyMMdd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setToastMessage({
        message: "PDF downloaded successfully.",
        variant: "success",
      });
    } catch {
      setToastMessage({ message: "Failed to export PDF.", variant: "danger" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getTimetables = () => {
    startTransition(async () => {
      try {
        const resp = await axios.get(`/api/schedules/timetables/`);
        setData(
          resp?.data.data.map((timetable: any) => ({
            ...timetable,
            campus: timetable.location.name,
          })),
        );
      } catch (error) {
        setToastMessage({
          message: String(error),
          variant: "danger",
        });
      }
    });
  };

  const publishTimeTable = async () => {
    setServerLoadingMessage({
      message: `Publishing timetable ...`,
      isServerLoading: true,
    });

    try {
      const resp = await axios.put("/api/exams/exams/publish/", {
        masterTimetable: selectedTimetableId,
      });

      setToastMessage({
        message: "Timetable published successfully",
        variant: "success",
      });
      setStatus(resp.data.status);
      // Update the local data without refetching
      setData((prevData) =>
        prevData.map((timetable) =>
          timetable.id === selectedTimetableId
            ? {
                ...timetable,
                status: timetable.status === "DRAFT" ? "PUBLISHED" : "DRAFT",
              }
            : timetable,
        ),
      );
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        setToastMessage({
          message: String(message),
          variant: "danger",
        });
      } else {
        setToastMessage({
          message: "Something went wrong",
          variant: "danger",
        });
      }
    } finally {
      setServerLoadingMessage({ isServerLoading: false });
    }
  };

  const deleteAllTimeTables = () => {
    setServerLoadingMessage({
      message: `Deleting timetables`,
      isServerLoading: true,
    });
    startDeletingTransition(async () => {
      try {
        await axios.delete("/api/exams/exams/truncate-mastertimetable/", {
          data: { id: selectedTimetableId },
        });
        setToastMessage({
          message: "Timetable deleted successfully",
          variant: "success",
        });
        setData((prevData) =>
          prevData.filter((timetable) => timetable.id !== selectedTimetableId),
        );
      } catch (error) {
        if (isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage({
            message: String(message),
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
        setShowDialog(false);
      }
    });
  };

  React.useEffect(() => {
    getTimetables();
  }, []);

  return isGettingExams ? (
    <TableSkeleton />
  ) : (
    <Dialog
      open={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        setShowDialogType(null);
      }}
    >
      <div className="w-full">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Input
            placeholder="Filter timetables..."
            value={
              (table.getColumn("academic_year")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("academic_year")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex-1"></div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                    {/* Separate Delete Button */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setShowDialogType("confirmation");
                              setShowDialog(true);
                              setSelectedTimetableId(row.getValue("id"));
                            }}
                            className="text-red-600"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTimetableId(row.getValue("id"));
                              publishTimeTable();
                            }}
                          >
                            <PrinterCheckIcon className="w-4 h-4" />
                            <span>
                              {(
                                row.getValue("status") as string
                              )?.toLowerCase() === "published"
                                ? "DRAFT"
                                : "Publish"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTimetableId(row.getValue("id"));
                              exportToPdf();
                            }}
                          >
                            <PrinterCheckIcon className="w-4 h-4" /> Export
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={row.original.status.toLowerCase() !== "published"} onClick={()=>navigate(`/admin/manual?id=${row.getValue("id")}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
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

      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
        <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
          <DialogTitle className="text-l font-bold  leading-tight">
            Confirm Delete
          </DialogTitle>

          <DialogDescription className="text-sm  max-w-md mx-auto leading-relaxed  text-center">
            Do you really want to perform this action?
          </DialogDescription>
        </DialogHeader>
        <div className="relative p-4">
          This will delete the timetable and all associated exams. This action
          cannot be undone.
        </div>

        <DialogFooter>
          <Button variant={"default"} onClick={() => deleteAllTimeTables()}>
            Yes
          </Button>
          <Button variant={"secondary"} onClick={() => setShowDialog(false)}>
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
