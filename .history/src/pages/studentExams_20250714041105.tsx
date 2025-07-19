
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

 
import {  ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import useUserAxios from "../hooks/useUserAxios"
import TableSkeleton from "../components/TableSkeleton"

 
// export type Exam= {
//   id:string,
//   course:string,
//   start_time:string,
//   end_time:string,
//   room:string,
//   status:string,
//   end_date:Date,
  
 

// }

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

interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor: string;
  department: Department;
  semester: Semester;
  prerequisites: any[]; // or specific type if known
  start_date: string;
  end_date: string;
  enrollment_limit: number;
  schedules: any[]; // or specific type if known
  students_enrolled: number;
}

interface Exam {
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

interface Room {
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("id")}</div>
    ),
  },
   {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("course")}</div>
    ),
  },
 
    {
    accessorKey: "date",
    header: () => <div className="text-right">Date</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
  },
    {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("status")}</div>,
  },
   {
    accessorKey: "start_time",
    header: () => <div className="text-right">Start Time</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("start_time")}</div>,
  },
  {
    accessorKey: "end_time",
    header: () => <div className="text-right">End Time</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("end_time")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const exam = row.original

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
      )
    },
  },
]

export function StudentExamsPage() {
  const axios= useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const[isGettingExams, startTransition]= React.useTransition()

  const getCourses=()=>{
    startTransition(async()=>{
    try {
        const resp= await axios.get("/api/exams/student-exam/mine")
        console.log(resp.data)
        setData(resp.data.data.map((data: any)=>{
          return {...data, course: data.course.title,}

        }))
        
    } catch (error) {
        console.log(error)
        
    }
  })

  }
const [data, setData]= React.useState<Exam[]>( [])

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
  })

React.useEffect(()=>{
    getCourses()
},[])

  return (

   isGettingExams?<TableSkeleton/>: <div className="w-full">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Input
          placeholder="Filter courses..."
          value={(table.getColumn("course")?.getFilterValue() as string) ?? ""}
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
                )
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
                  )
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
  )
}
