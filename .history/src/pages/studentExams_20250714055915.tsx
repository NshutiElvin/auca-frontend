
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


    
<DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
  <DialogHeader className="text-center space-y-4 pb-2">
    <div className="mx-auto  rounded-full flex items-center justify-center">
      <QrCode className="w-24 h-24"/>
    </div>
    
    <DialogTitle className="text-l font-bold  leading-tight">
      Scan for Exam Details
    </DialogTitle>
    
    <DialogDescription className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
      Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
    </DialogDescription>
  </DialogHeader>
  
  {selectedRow && (
    <div className="flex flex-col items-center space-y-6 py-4">
      {/* QR Code Container */}
      <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-500 rounded-tl-lg"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-500 rounded-tr-lg"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-blue-500 rounded-bl-lg"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-blue-500 rounded-br-lg"></div>
        
        <div className="relative">
          <QRCode
            size={180}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={selectedRow.id}
            viewBox={`0 0 256 256`}
            level="M"
            className="rounded-lg"
          />
        </div>
      </div>
      
       
      
      {/* Exam ID Badge */}
      <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Exam ID:</span>
          <span className="font-mono font-medium text-gray-900">{selectedRow.id}</span>
        </div>
      </div>
    </div>
  )}
  
  {/* Footer */}
  <div className="pt-4 border-t border-gray-100">
    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
      <span>Secure access via QR code</span>
    </div>
  </div>
</DialogContent>


       </div>
       </Dialog>
  )
}
