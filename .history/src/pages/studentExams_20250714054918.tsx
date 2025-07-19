
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

 
import {  ChevronDown, Copy, MoreHorizontal, QrCode, Smartphone, X } from "lucide-react"

import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import QRCode from "react-qr-code";

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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"

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
    accessorKey: "room",
    header: () => <div className="text-right">Room</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("room")}</div>,
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
  }
 
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
const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<Exam | null>(null);
  const getCourses=()=>{
    startTransition(async()=>{
    try {
        const resp= await axios.get("/api/exams/student-exam/mine")
        console.log(resp.data)
        setData(resp.data.data.map((data: any)=>{
          return {...data, course: data.exam.course.title,date:data.exam.date,room:data.room.name, start_time:data.exam.start_time, end_time:data.exam.end_time}

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

   isGettingExams?<TableSkeleton/>:
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <div className="w-full">
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


    
  
   <DialogContent className="sm:max-w-[500px]">
  <DialogHeader className="text-center space-y-3">
    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <QrCode className="w-6 h-6 text-blue-600" />
    </div>
    <DialogTitle className="text-xl font-semibold text-gray-900">
      Scan for Exam Details
    </DialogTitle>
    <DialogDescription className="text-sm text-gray-600 max-w-sm mx-auto">
      Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
    </DialogDescription>
  </DialogHeader>
  
  {selectedRow && (
    <div className="flex flex-col items-center space-y-4 py-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <QRCode
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={selectedRow.id}
            viewBox={`0 0 256 256`}
            level="M"
          />
        </div>
      </div>
      
      
      
       
    </div>
  )}
  
  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
    <DialogClose asChild>
      <Button variant="outline" className="w-full sm:w-auto">
        <X className="w-4 h-4 mr-2" />
        Close
      </Button>
    </DialogClose>
    <Button 
      onClick={() => {
        // Copy ID to clipboard
        navigator.clipboard.writeText(selectedRow?.id || '');
        // You might want to show a toast notification here
      }}
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
    >
      <Copy className="w-4 h-4 mr-2" />
      Copy ID
    </Button>
  </DialogFooter>
</DialogContent>


       </div>
       </Dialog>
  )
}
