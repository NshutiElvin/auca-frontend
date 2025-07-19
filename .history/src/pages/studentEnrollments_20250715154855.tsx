
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

import {  ChevronDown } from "lucide-react"

import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { StatusButton } from "../components/ui/status-button"
import { Course } from "./studentExams"

 
export type Exam= {
  id:string,
  course:string,
  start_time:string,
  end_time:string,
  room:string,
  status:string,
  end_date:Date,
}

export interface Enrollment{
  id:string;
  enrollement_date:string;
  course:Course;
  status:string;
  final_grade:string;
  amount_paid:string;
  amount_to_pay:string
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
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("credits")}</div>
    ),
  },
 
    {
    accessorKey: "enrollment_date",
    header: () => <div className="text-right">Date</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("enrollment_date")}</div>,
  },
    
   {
    accessorKey: "amount_to_pay",
    header: () => <div className="text-right">Amount</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("amount_to_pay")}</div>,
  },
  {
    accessorKey: "amount_paid",
    header: () => <div className="text-right">Paid</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("amount_paid")}</div>,
  },

  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
   cell: ({ row }) =>  <StatusButton status={row.getValue("status")}/>,
  },
]

export function EnrollmentsPage() {
  const axios= useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const[isGettingExams, startTransition]= React.useTransition()
  const [data, setData]= React.useState<Exam[]>( [])
 

  const getCourses=()=>{
    startTransition(async()=>{
    try {
        const resp= await axios.get("/api/enrollments/mine")
        setData(resp.data.data.map((data: any)=>{
          return {...data, course: data.course.title,credits:data.course.credits }

        }))
        
    } catch (error) {
        console.log(error)
        
    }
  })

  }


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

    <div className="flex justify-between">
      <div className="border-red-950">first</div>
      <div>second</div>
      <div>third</div>
      <div>forth</div>
      <div>sixth</div>
      <div>eight</div>
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
              <TableRow key={headerGroup.id} >
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
