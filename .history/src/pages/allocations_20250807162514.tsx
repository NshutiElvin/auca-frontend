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
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

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
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import { string } from "zod";

export type StudentExam = {
  id: string;
  reg_no: string;
  department: string;
  exam: string;
  room: string;
  status: string;
  email: string;
  date: string;
};
 
export const columns: ColumnDef<StudentExam>[] = [
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("reg_no")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-right">Email</div>,
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },

  {
    accessorKey: "date",
    header: () => <div className="text-right">Date</div>,
    cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "exam",
    header: () => <div className="text-right">Exam</div>,
    cell: ({ row }) => <div className="lowercase">{row.getValue("exam")}</div>,
  },
  {
    accessorKey: "room",
    header: () => <div className="text-right">Room</div>,
    cell: ({ row }) => <div className="lowercase">{row.getValue("room")}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("status")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const exam = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(exam.id)}
            >
              Copy course ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View course</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function AllocationsPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<StudentExam[]>([]);
  const[next, setNext]= React.useState<string|null>(null)
   const[previous, setPrevious]= React.useState<string|null>(null)
  const[nextUrl, setNextUrl]= React.useState<string|null>()

console.log(next)
  const fetchExams = () => {
    startTransition(async () => {
      try {
        const resp = await axios.get(nextUrl?nextUrl:"/api/exams/student-exam/?limit=10&offset=0");
        const nextUri= resp.data.next.split("?")[1]
        const uri= "/api/exams/student-exam/?"+nextUri
        setNext(uri)
        if (resp.data?.previous){
            const previousUri= resp.data.previous.split("?")[1]
        const uri= "/api/exams/student-exam/?"+previousUri
        setPrevious(uri)

        }

        const formattedData = resp.data.results.data.map((data: any) => {
          return {
            ...data,
            reg_no: data.student.reg_no,
            email: data.student.user.email,
            department: data.student.department.name,
            exam: data.exam?.group?.course?.title,
            date: data.exam?.date,
            room: data.exam.room,
          };
        });

        setData(formattedData);
      } catch (error) {
        if (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            ("name" in error || "code" in error)
          ) {
            const err = error as {
              name?: string;
              code?: string;
              message?: string;
            };
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
              console.log("Request was canceled.");
            } else {
              console.error("Request error:", error);
              setError(err.message || "Failed to load data. Please try again.");
            }
          } else {
            console.error("Unknown error:", error);
            setError("An unexpected error occurred. Please try again.");
          }
        }
      }
    });
  };

  
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,  
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const valuesToCheck = [
        row.original.reg_no,
        row.original.email,
        row.original.department,
        row.original.exam,
        row.original.room,
        row.original.status,
        row.original.date,
      ];
      return valuesToCheck.some((value) =>
        (value || "").toLowerCase().includes(search)
      );
    },
  });

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    fetchExams();
  }, [nextUrl]);

  React.useEffect(()=>{
    setNextUrl("/api/exams/student-exam/?limit=10&offset=0")
  },[])

  return isLoading ? (
    <TableSkeleton />
  ) : error ? (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button
        variant="outline"
        onClick={() => {
          fetchExams();
        }}
      >
        Retry
      </Button>
    </div>
  ) : (
    <div className="w-full">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
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
            disabled={previous==null}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              next&&setNextUrl(next)
            }}
            disabled={next==null}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
