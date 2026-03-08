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

import { Dialog, DialogContent } from "../components/ui/dialog";

import { ChevronDown } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

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
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import { StatusButton } from "../components/ui/status-button";
import { Course } from "./studentExams";
import useToast from "../hooks/useToast";

export type Exam = {
  id: string;
  course: string;
  start_time: string;
  end_time: string;
  room: string;
  status: string;
  end_date: Date;
  enrollement_date: string;
  final_grade: string;
  amount_paid: string;
  amount_to_pay: string;
  credits: string;
};

interface Stat {
  courses: number;
  credits: number;
  due: number;
  paid: number;
  balance: number;
  active: number;
}

export interface Enrollment {
  id: string;
  enrollement_date: string;
  course: Course;
  status: string;
  final_grade: string;
  amount_paid: string;
  amount_to_pay: string;
}

export function EnrollmentsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isGettingExams, startTransition] = React.useTransition();
  const [data, setData] = React.useState<Exam[]>([]);
  const [stat, setStat] = React.useState<Stat>({
    courses: 0,
    credits: 0,
    active: 0,
    balance: 0,
    due: 0,
    paid: 0,
  });
  const { setToastMessage } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [selectedRow, setSelectedRow] = React.useState<Exam | null>(null);
  const [highlightedColumn, setHighlightedColumn] = React.useState<
    string | null
  >(null);

  const getStat = ({ enrollments }: { enrollments: Enrollment[] }) => {
    const myStats = {
      courses: enrollments.length,
      credits: 0,
      active: 0,
      balance: 0,
      due: 0,
      paid: 0,
    };
    enrollments.forEach((enrollment) => {
      myStats.credits += Number(enrollment.course.credits);
      myStats.active += enrollment.status == "active" ? 1 : 0;
      myStats.due += Number(enrollment.amount_to_pay);
      myStats.paid = Number(enrollment.amount_paid);
    });
    myStats.balance = myStats.due - myStats.paid;
    setStat({ ...myStats });
  };

  const getCourses = () => {
    startTransition(async () => {
      try {
        const resp = await axios.get("/api/enrollments/mine");
        setData(
          resp.data.data.map((data: any) => {
            return {
              ...data,
              course: `${data.course.title}`,
              credits: data.course.credits,
              balance: (
                Number(data.amount_to_pay) - Number(data.amount_paid)
              ).toFixed(2),
              group: data?.group?.group_name,
              semester: data.course.semester.name,
            };
          })
        );
        getStat({ enrollments: resp.data.data });
      } catch (error) {
        setToastMessage({
          variant: "danger",
          message: "unable to retrieve your enrollment.",
        });
      }
    });
  };

  const handleCardClick = (columnKey: string) => {
    setHighlightedColumn(highlightedColumn === columnKey ? null : columnKey);
  };

  // Helper: shared cell className for highlighted columns
  const cellCls = (col: string, extra = "") =>
    `${extra} ${highlightedColumn === col ? "bg-zinc-500" : ""}`.trim();

  const columns: ColumnDef<Exam>[] = [
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
      header: () => (
        <div className={cellCls("id", "font-medium")}>Id</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("id", "capitalize")}>{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "course",
      header: () => (
        <div className={cellCls("course", "font-medium")}>Course</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("course", "capitalize")}>{row.getValue("course")}</div>
      ),
    },
    {
      accessorKey: "group",
      header: () => (
        <div className={cellCls("group", "font-medium")}>Group</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("group", "capitalize")}>{row.getValue("group")}</div>
      ),
    },
    {
      accessorKey: "semester",
      header: () => (
        <div className={cellCls("semester", "font-medium")}>Semester</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("semester", "capitalize")}>{row.getValue("semester")}</div>
      ),
    },
    {
      accessorKey: "credits",
      header: () => (
        <div className={cellCls("credits", "font-medium")}>Credits</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("credits")}>{row.getValue("credits")}</div>
      ),
    },
    {
      accessorKey: "amount_to_pay",
      header: () => (
        <div className={cellCls("amount_to_pay", "text-right font-medium")}>Amount</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("amount_to_pay", "text-right tabular-nums")}>
          {row.getValue("amount_to_pay")}
        </div>
      ),
    },
    {
      accessorKey: "amount_paid",
      header: () => (
        <div className={cellCls("amount_paid", "text-right font-medium")}>Paid</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("amount_paid", "text-right tabular-nums")}>
          {row.getValue("amount_paid")}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: () => (
        <div className={cellCls("balance", "text-right font-medium")}>Balance</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("balance", "text-right tabular-nums")}>
          {row.getValue("balance")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className={cellCls("status", "text-center font-medium")}>Status</div>
      ),
      cell: ({ row }) => (
        <div className={cellCls("status", "flex justify-center")}>
          <StatusButton status={row.getValue("status")} />
        </div>
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
  });

  React.useEffect(() => {
    getCourses();
  }, []);

  return isGettingExams ? (
    <TableSkeleton />
  ) : (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="w-full space-y-4">
        <div className="flex justify-between gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 pb-2">
          {/* Stat cards */}
          {[
            { key: "course", label: "Courses", value: stat.courses },
            { key: "credits", label: "Credits", value: stat.credits },
            {
              key: "amount_to_pay",
              label: "Due",
              value: stat.due.toFixed(2),
              colorCls: "bg-amber-200 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200",
            },
            {
              key: "amount_paid",
              label: "Paid",
              value: stat.paid.toFixed(2),
              colorCls: "bg-green-200 dark:bg-green-800/40 text-green-900 dark:text-green-200",
            },
            {
              key: "balance",
              label: "Balance",
              value: stat.balance.toFixed(2),
              colorCls: "bg-red-200 dark:bg-red-800/40 text-red-900 dark:text-red-200",
            },
            { key: "status", label: "Active", value: stat.active },
          ].map(({ key, label, value, colorCls }) => (
            <div
              key={key}
              className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
                highlightedColumn === key
                  ? "bg-gray-200 dark:bg-gray-700"
                  : colorCls ?? ""
              }`}
              onClick={() => handleCardClick(key)}
            >
              <div className="text-center font-bold font-sans">{label}</div>
              <div className="text-center font-light">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Input
            placeholder="Filter courses..."
            value={(table.getColumn("course")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("course")?.setFilterValue(event.target.value)
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                    onClick={() => {
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

      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {selectedRow && (
          <div className="flex flex-col space-y-6 py-6 max-w-2xl mx-auto">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-center">Course Information</h2>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  {[
                    { label: "Course Name", value: selectedRow.course },
                    { label: "Credits", value: `${selectedRow.credits} Credits` },
                    { label: "Status", value: selectedRow.status },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex justify-between items-start py-2 ${
                        i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-center">Payment Information</h2>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  {[
                    { label: "Total Amount", value: selectedRow.amount_to_pay },
                    { label: "Paid", value: selectedRow.amount_paid },
                    {
                      label: "Outstanding Balance",
                      value: (Number(selectedRow.amount_to_pay) - Number(selectedRow.amount_paid)).toFixed(2),
                    },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex justify-between items-start py-2 ${
                        i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}