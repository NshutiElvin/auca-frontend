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
  
} from "../components/ui/dialog";

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
  const [highlightedColumn, setHighlightedColumn] = React.useState<string | null>(null);

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
              course: data.course.title,
              credits: data.course.credits,
              balance: (
                Number(data.amount_to_pay) - Number(data.amount_paid)
              ).toFixed(2),
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
        <div className={highlightedColumn === "id" ? "bg-yellow-800 font-bold" : ""}>
          Id
        </div>
      ),
      cell: ({ row }) => (
        <div className={`capitalize ${highlightedColumn === "id" ? "bg-blue-100" : ""}`}>
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: ({ column }) => (
        <div className={highlightedColumn === "course" ? "bg-yellow-800 font-bold" : ""}>
          Course
        </div>
      ),
      cell: ({ row }) => (
        <div className={`capitalize ${highlightedColumn === "course" ? "bg-blue-100" : ""}`}>
          {row.getValue("course")}
        </div>
      ),
    },
    {
      accessorKey: "credits",
      header: ({ column }) => (
        <div className={highlightedColumn === "credits" ? "bg-yellow-800 font-bold" : ""}>
          Credits
        </div>
      ),
      cell: ({ row }) => (
        <div className={`capitalize ${highlightedColumn === "credits" ? "bg-blue-100" : ""}`}>
          {row.getValue("credits")}
        </div>
      ),
    },
    {
      accessorKey: "enrollment_date",
      header: ({ column }) => (
        <div className={`text-right ${highlightedColumn === "enrollment_date" ? "bg-yellow-800 font-bold" : ""}`}>
          Date
        </div>
      ),
      cell: ({ row }) => (
        <div className={`lowercase ${highlightedColumn === "enrollment_date" ? "bg-blue-100" : ""}`}>
          {row.getValue("enrollment_date")}
        </div>
      ),
    },
    {
      accessorKey: "amount_to_pay",
      header: ({ column }) => (
        <div className={`text-right ${highlightedColumn === "amount_to_pay" ? "bg-yellow-800 font-bold" : ""}`}>
          Amount
        </div>
      ),
      cell: ({ row }) => (
        <div className={`lowercase ${highlightedColumn === "amount_to_pay" ? "bg-blue-100" : ""}`}>
          {row.getValue("amount_to_pay")}
        </div>
      ),
    },
    {
      accessorKey: "amount_paid",
      header: ({ column }) => (
        <div className={`text-right ${highlightedColumn === "amount_paid" ? "bg-yellow-800 font-bold" : ""}`}>
          Paid
        </div>
      ),
      cell: ({ row }) => (
        <div className={`lowercase ${highlightedColumn === "amount_paid" ? "bg-blue-100" : ""}`}>
          {row.getValue("amount_paid")}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <div className={`text-right ${highlightedColumn === "balance" ? "bg-yellow-800 font-bold" : ""}`}>
          Balance
        </div>
      ),
      cell: ({ row }) => (
        <div className={`lowercase ${highlightedColumn === "balance" ? "bg-blue-100" : ""}`}>
          {row.getValue("balance")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className={`text-right ${highlightedColumn === "status" ? "bg-yellow-800 font-bold" : ""}`}>
          Status
        </div>
      ),
      cell: ({ row }) => (
        <div className={highlightedColumn === "status" ? "bg-blue-100" : ""}>
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
        <div className="flex justify-between gap-2 overflow-x-scroll">
          <div 
            className={`border-2 p-1 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "course" ? "bg-yellow-800 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("course")}
          >
            <div className="text-center font-bold font-sans">Courses</div>
            <div className="text-center font-light">{stat.courses}</div>
          </div>
          <div 
            className={`border-2 p-2 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "credits" ? "bg-yellow-800 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("credits")}
          >
            <div className="text-center font-bold font-sans">Credits</div>
            <div className="text-center font-light">{stat.credits}</div>
          </div>
          <div 
            className={`border-2 p-2 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "amount_to_pay" ? "bg-yellow-800 border-blue-400" : "bg-yellow-100"
            }`}
            onClick={() => handleCardClick("amount_to_pay")}
          >
            <div className="text-center font-bold font-sans">Due</div>
            <div className="text-center font-light">{stat.due.toFixed(2)}</div>
          </div>
          <div 
            className={`border-2 p-2 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "amount_paid" ? "bg-yellow-800 border-blue-400" : "bg-green-200"
            }`}
            onClick={() => handleCardClick("amount_paid")}
          >
            <div className="text-center font-bold font-sans">Paid</div>
            <div className="text-center font-light">{stat.paid.toFixed(2)}</div>
          </div>
          <div 
            className={`border-2 p-2 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "balance" ? "bg-yellow-800 border-blue-400" : "bg-red-200"
            }`}
            onClick={() => handleCardClick("balance")}
          >
            <div className="text-center font-bold font-sans">Balance</div>
            <div className="text-center font-light">
              {stat.balance.toFixed(2)}
            </div>
          </div>
          <div 
            className={`border-2 p-2 border-solid w-full rounded-sm cursor-pointer hover:bg-opacity-50 transition-colors ${
              highlightedColumn === "status" ? "bg-yellow-800 border-blue-400" : ""
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
          <div className="flex flex-col items-center space-y-2 py-4">
            <h2 className="text-center font-bold">
              Course Information
            </h2>
            <div className="w-full relative p-4 rounded shadow-md border  hover:shadow-md transition-shadow duration-300">
              <div  className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-500">Course Name</div>
                <div className="font-medium text-gray-900">
                  {selectedRow.course}
                </div>
                <div className="text-sm text-gray-500">Credits</div>
                  <div className="font-medium text-gray-900">{selectedRow.credits} Credits</div>
                    <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium text-gray-900">{selectedRow.status}</div>
              </div>
            </div>
             <h2 className="text-center font-bold">
              Payment Information
            </h2>
            <div className="w-full relative p-4 rounded shadow-md border hover:shadow-md transition-shadow duration-300">
              <div  className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-medium text-gray-900">
                  {selectedRow.amount_to_pay}
                </div>
                <div className="text-sm text-gray-500">Paid</div>
                  <div className="font-medium text-gray-900">{selectedRow.amount_paid}</div>

                  <div className="text-sm text-gray-500">Outstanding Balance</div>
                  <div className="font-medium text-gray-900">{(Number(selectedRow.amount_to_pay)-Number(selectedRow.amount_paid)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}