
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

 
export type Course= {
  code:string,
  title:string,
  description:string,
  credits:string,
  instructor:string,
  semester:any,
  start_date: Date,
  end_date:Date,
  enrollment_limit:number,
  prerequisites:any[],
  schedules:any[],
  


}

export type Department= {
  code:string,
  name:string,
  
}
interface FormData{
    id:number,
  code:string,
  title:string,
  description:string,
  credits:number,
  instructor:number,
  department:number,
  semester:number,
  start_date: Date,
  end_date:Date,
  enrollment_limit:number,
  created_at:Date,
  updated_at:Date

}

export const columns: ColumnDef<Course>[] = [
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
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("code")}</div>
    ),
  },
   {
    accessorKey: "title",
    header: "title",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
 
    {
    accessorKey: "credits",
    header: () => <div className="text-right">Credits</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("credits")}</div>,
  },
    {
    accessorKey: "department",
    header: () => <div className="text-right">Department</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("department")}</div>,
  },
   {
    accessorKey: "semester",
    header: () => <div className="text-right">Semester</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("semester")}</div>,
  },

   {
    accessorKey: "enrollments",
    header: () => <div className="text-right">Enrollments</div>,
   cell: ({ row }) => <div className="lowercase">{row.getValue("enrollments")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const course = row.original

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
              onClick={() => navigator.clipboard.writeText(course.code)}
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

export function CoursesPage() {
  const axios= useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const getCourses=async()=>{
    try {
        const resp= await axios.get("/api/courses/")
        
        setData(resp.data.data.map((data: any)=>{
          return {...data, department: data.department.name, enrollments:data.students_enrolled, semester:data.semester.name}

        }))
        
    } catch (error) {
        console.log(error)
        
    }
  }
const [data, setData]= React.useState<Course[]>( [])

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

     <Dialog>
    <div className="w-full">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex-1"></div>
       <div>
        <DialogTrigger asChild>
        <Button className="mx-2"><PlusCircle className="h-50 w-50"/>Add new Course</Button>
      </DialogTrigger>
         
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


     
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>Create New Course</DialogTitle>
    <DialogDescription>
      Fill in the details to create a new course.
    </DialogDescription>
  </DialogHeader>

  <form>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      <div>
        <Label htmlFor="code">Module Code</Label>
        <Input id="code" name="code" placeholder="e.g. CS101" />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Intro to CS" />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Course description..." />
      </div>

      <div>
        <Label htmlFor="credits">Credits</Label>
        <Input id="credits" name="credits" type="number" placeholder="e.g. 3" />
      </div>
      <div>
        <Label htmlFor="instructor">Instructor ID</Label>
        <Input id="instructor" name="instructor" type="number" placeholder="e.g. 1" />
      </div>

      <div>
        <Label htmlFor="department">Department ID</Label>
        <Input id="department" name="department" type="number" placeholder="e.g. 2" />
      </div>
      <div>
        <Label htmlFor="semester">Semester</Label>
        <Input id="semester" name="semester" type="number" placeholder="e.g. 1" />
      </div>

      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input id="start_date" name="start_date" type="date" />
      </div>
      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input id="end_date" name="end_date" type="date" />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="enrollment_limit">Enrollment Limit</Label>
        <Input id="enrollment_limit" name="enrollment_limit" type="number" placeholder="e.g. 50" />
      </div>
    </div>

    <DialogFooter>
      <Button type="submit">Create Course</Button>
    </DialogFooter>
  </form>
</DialogContent>

   
    </div>
     </Dialog>
  )
}
