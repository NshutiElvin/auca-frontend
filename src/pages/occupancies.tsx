
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusCircle } from "lucide-react"

import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"

import { Label } from "../components/ui/label"
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
import { Textarea } from "../components/textarea"
import useUserAxios from "../hooks/useUserAxios"
import TableSkeleton from "../components/TableSkeleton"

 
export type RoomOccupancy = {
  room_id: number
  room_name: string
  date: string
  start_time: string
  end_time: string
  exam_id: number
  course_code: string
  student_count: number
  course_title:string
}

 
 

export const occupancyColumns: ColumnDef<RoomOccupancy>[] = [
  {
    accessorKey: "room_name",
    header: "Room",
  },
  {
    accessorKey: "course_code",
    header: "Course Code",
  },
  {
    accessorKey: "course_title",
    header: "Course Title",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
  },
  {
    accessorKey: "end_time",
    header: "End Time",
  },
  {
    accessorKey: "student_count",
    header: "Occupancy",
    cell: ({ row }) => <span>{row.getValue("student_count")} student(s)</span>,
  },
]


export function OccupanciesPage() {
  const axios = useUserAxios()
  const [data, setData] = React.useState<RoomOccupancy[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const[isGettingOccupancies, startTransition]= React.useTransition()


 const fetchOccupancies = ()=>{
  startTransition(async () => {
  try {
    const resp = await axios.get("/api/rooms/occupancies/")
    const flatData: RoomOccupancy[] = []
    for (const room of resp.data.data) {
      for (const schedule of room.schedules) {
        for (const exam of schedule.exams) {
          flatData.push({
            room_id: room.room_id,
            room_name: room.room_name,
            date: schedule.date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            exam_id: exam.exam_id,
            course_code: exam.course_code,
            student_count: exam.student_count,
            course_title:exam.course_title
          })
        }
      }
    }

    setData(flatData)
  } catch (error) {
    console.error("Error fetching occupancies:", error)
  }
})
 }


  const table = useReactTable({
    data,
    columns: occupancyColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  React.useEffect(() => {
    fetchOccupancies()
  }, [])

  return (
   isGettingOccupancies?<TableSkeleton/>: <div className="w-full">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Input
          placeholder="Filter by room..."
          value={(table.getColumn("date")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("date")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className="capitalize"
                checked={col.getIsVisible()}
                onCheckedChange={(val) => col.toggleVisibility(!!val)}
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={occupancyColumns.length} className="h-24 text-center">
                  No occupancies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

