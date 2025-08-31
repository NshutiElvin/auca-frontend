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

import { ChevronDown, MoreHorizontal } from "lucide-react";

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
import { StatusButton } from "../components/ui/status-button";
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
  room:string |null;
};

export function InstructorAllocationsPage() {
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
  const[room, setRoom]= React.useState<string|null>(null)
  const [nextUrl, setNextUrl] = React.useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = React.useState<string | null>(null);
  const { setToastMessage } = useToast();
    const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  
  const fetchExams = (url: string | null) => {
    startTransition(async () => {
      try {
        const resp = await axios.request({
          url: url ?? "/api/exams/student-exam/instructor_student_exams",
          method: "get",
          baseURL: undefined,
        });

        const formattedData = resp.data.students.map((data: any) => {
          return {
            id: data.id,
            student_id: data.student.id,
            exam_id: data.exam.id,
            reg_no: data.student.reg_no,
            name:
              data.student.user.first_name + " " + data.student.user.last_name,
            faculity: data.student.department.name,
            exam: data.exam?.group?.course?.title,
            signin: data?.signin_attendance,
            signout: data?.signout_attendance,
            room:data.exam?.room?.room_name
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

  const signinStudent = async (student_id: string, exam_id: string, checked:boolean) => {
    const pageIndexBeforeUpdate = table.getState().pagination.pageIndex;
    try {
      const resp = await axios.patch("/api/exams/exams/student_signin", {
        student_id,
        exam_id,
      });
      if (resp.data.success) {
        // Update the specific student's signin status
        setData(prevData => 
          prevData.map(item => 
            item.student_id === student_id && item.exam_id === exam_id 
              ? {...item, signin: checked} 
              : item
          )
        );
         setTimeout(() => {
          table.setPageIndex(pageIndexBeforeUpdate);
        }, 0);
        setToastMessage({
          message: "Attendance marked successfully",
          variant: "success",
        });
      }
    } catch (error) {
      setToastMessage({
        message: "Failed to mark attendance",
        variant: "danger",
      });
    }
  };

  const signoutStudent = async (student_id: string, exam_id: string, checked:boolean) => {
    const pageIndexBeforeUpdate = table.getState().pagination.pageIndex;
    try {
      const resp = await axios.patch("/api/exams/exams/student_signout", {
        student_id,
        exam_id,
      });
      if (resp.data.success) {
        // Update the specific student's signout status
        setData(prevData => 
          prevData.map(item => 
            item.student_id === student_id && item.exam_id === exam_id 
              ? {...item, signout: true} 
              : item
          )
        );
         setTimeout(() => {
          table.setPageIndex(pageIndexBeforeUpdate);
        }, 0);
        setToastMessage({
          message: "Attendance marked successfully",
          variant: "success",
        });
      }
    } catch (error) {
      setToastMessage({
        message: "Failed to mark attendance",
        variant: "danger",
      });
    }
  };

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
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("reg_no")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: () => <div className="text-right">Name</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "faculity",
      header: () => <div className="text-right">Faculity</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("faculity")}</div>
      ),
    },
    {
      accessorKey: "exam",
      header: () => <div className="text-right">Exam</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("exam")}</div>
      ),
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
            className="h-8 w-8 border disabled:bg-primary"
            onCheckedChange={(checked) => {
                 if(typeof checked === "boolean"){
                    signinStudent(studentId, examId, checked);
                 }
            }}
            disabled={isSignedIn}
          />
        );
      },
    },
    {
      accessorKey: "signout",
      header: () => <div className="text-right">Signed out</div>,
      cell: ({ row }) => {
        const isSignedOut = row.getValue("signout") as boolean;
        const isSignedin = row.getValue("signin") as boolean;
        const studentId = row.original.student_id;
        const examId = row.original.exam_id;
        
        return (
          <Checkbox
            checked={isSignedOut}
            className="h-8 w-8 border disabled:bg-primary"
            onCheckedChange={(checked) => {
                if(!isSignedin){
                    setToastMessage({message:"You need to make checkin first.", variant:"danger"})
                }
              if(typeof checked === "boolean"){
                    signoutStudent(studentId, examId, checked);
                 }
            }}
            disabled={isSignedOut}
          />
        );
      },
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
        row.original.name,
        row.original.faculity,
        row.original.exam,
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
     setRoom(data[0].room)
  }, []);

  React.useEffect(() => {
    fetchExams(null);
  }, []);

   React.useEffect(() => {
    setCurrentPageIndex(table.getState().pagination.pageIndex);
  }, [table.getState().pagination.pageIndex]);

  return isLoading ? (
    <TableSkeleton />
  ) : error ? (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button
        variant="outline"
        onClick={() => {
          fetchExams(null);
        }}
      >
        Retry
      </Button>
    </div>
  ) : (
    <div className="w-full flex flex-col">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
             <motion.h2
            key={new Date().getMonth()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl tracking-tighter font-bold"
          >{new Date().getDay()}
            {new Date().toLocaleString("default", { month: "long" })}{" "}
            {new Date().getFullYear()}
          </motion.h2>
          <Badge variant={"default"}>{room}</Badge>
        </div>
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
            onClick={() => {
              setCurrentPageIndex(table.getState().pagination.pageIndex - 1);
              table.previousPage();
            }}
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
            onClick={() => {
              setCurrentPageIndex(table.getState().pagination.pageIndex + 1);
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}