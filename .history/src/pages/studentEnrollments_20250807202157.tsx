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
    enrollments.forEach((enrollment, idx) => {
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
              group: data.group.group_name,
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
      header: ({ column }) => (
        <div
          className={highlightedColumn === "id" ? "bg-slate-500 font-bold" : ""}
        >
          Id
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`capitalize ${
            highlightedColumn === "id" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: ({ column }) => (
        <div
          className={
            highlightedColumn === "course" ? "bg-zinc-500 font-bold" : ""
          }
        >
          Course
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`capitalize ${
            highlightedColumn === "course" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("course")}
        </div>
      ),
    },

    {
      accessorKey: "group",
      header: ({ column }) => (
        <div
          className={
            highlightedColumn === "group" ? "bg-zinc-500 font-bold" : ""
          }
        >
          Group
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`capitalize ${
            highlightedColumn === "group" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("group")}
        </div>
      ),
    },

    {
      accessorKey: "semester",
      header: ({ column }) => (
        <div
          className={
            highlightedColumn === "semester" ? "bg-zinc-500 font-bold" : ""
          }
        >
          Semester
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`capitalize ${
            highlightedColumn === "semester" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("semester")}
        </div>
      ),
    },
    {
      accessorKey: "credits",
      header: ({ column }) => (
        <div
          className={
            highlightedColumn === "credits" ? "bg-zinc-500 font-bold" : ""
          }
        >
          Credits
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`capitalize ${
            highlightedColumn === "credits" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("credits")}
        </div>
      ),
    },

    {
      accessorKey: "amount_to_pay",
      header: ({ column }) => (
        <div
          className={`text-right ${
            highlightedColumn === "amount_to_pay" ? "bg-zinc-500 font-bold" : ""
          }`}
        >
          Amount
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`lowercase ${
            highlightedColumn === "amount_to_pay" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("amount_to_pay")}
        </div>
      ),
    },
    {
      accessorKey: "amount_paid",
      header: ({ column }) => (
        <div
          className={`text-right ${
            highlightedColumn === "amount_paid" ? "bg-zinc-500 font-bold" : ""
          }`}
        >
          Paid
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`lowercase ${
            highlightedColumn === "amount_paid" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("amount_paid")}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <div
          className={`text-right ${
            highlightedColumn === "balance" ? "bg-zinc-500" : ""
          }`}
        >
          Balance
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`lowercase ${
            highlightedColumn === "balance" ? "bg-zinc-500" : ""
          }`}
        >
          {row.getValue("balance")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className={`text-right ${
            highlightedColumn === "status" ? "bg-zinc-500 font-bold" : ""
          }`}
        >
          Status
        </div>
      ),
      cell: ({ row }) => (
        <div className={highlightedColumn === "status" ? "bg-zinc-500" : ""}>
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
      <div className="w-full">
        <div className="flex justify-between gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 pb-2">
          <div
            className={`p-1 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "course"
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
            onClick={() => handleCardClick("course")}
          >
            <div className="text-center font-bold font-sans">Courses</div>
            <div className="text-center font-light">{stat.courses}</div>
          </div>
          <div
            className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "credits"
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
            onClick={() => handleCardClick("credits")}
          >
            <div className="text-center font-bold font-sans">Credits</div>
            <div className="text-center font-light">{stat.credits}</div>
          </div>
          <div
            className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "amount_to_pay"
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-amber-200 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200"
            }`}
            onClick={() => handleCardClick("amount_to_pay")}
          >
            <div className="text-center font-bold font-sans">Due</div>
            <div className="text-center font-light">{stat.due.toFixed(2)}</div>
          </div>
          <div
            className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "amount_paid"
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-green-200 dark:bg-green-800/40 text-green-900 dark:text-green-200"
            }`}
            onClick={() => handleCardClick("amount_paid")}
          >
            <div className="text-center font-bold font-sans">Paid</div>
            <div className="text-center font-light">{stat.paid.toFixed(2)}</div>
          </div>
          <div
            className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "balance"
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-red-200 dark:bg-red-800/40 text-red-900 dark:text-red-200"
            }`}
            onClick={() => handleCardClick("balance")}
          >
            <div className="text-center font-bold font-sans">Balance</div>
            <div className="text-center font-light">
              {stat.balance.toFixed(2)}
            </div>
          </div>
          <div
            className={`p-2 w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "status"
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
            onClick={() => handleCardClick("status")}
          >
            <div className="text-center font-bold font-sans">Active</div>
            <div className="text-center font-light">{stat.active}</div>
          </div>
        </div>
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Input
            placeholder="Filter courses..."
            value={
              (table.getColumn("course")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("course")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex-1"></div>
          <div>
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
                    onClick={() => {
                      setSelectedRow(row.original);
                      setDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
        {selectedRow && (
          <div className="flex flex-col space-y-6 py-6 max-w-2xl mx-auto">
            {/* Course Information Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                Course Information
              </h2>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Course Name
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-right ml-4">
                      {selectedRow.course}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Credits
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedRow.credits} Credits
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedRow.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                Payment Information
              </h2>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Amount
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedRow.amount_to_pay}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Paid
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedRow.amount_paid}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Outstanding Balance
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(
                        Number(selectedRow.amount_to_pay) -
                        Number(selectedRow.amount_paid)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
