import { Skeleton } from "../components/ui/skeleton"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"


export default function TableSkeleton() {
  const rows = Array.from({ length: 10 }, (_, i) => i)
  const cols = Array.from({ length: 5 }, (_, i) => i)

  return (
    <div className="w-full">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-10 w-[200px]" />  
        <div className="flex-1" />
        <Skeleton className="h-10 w-[120px]" />  
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-[120px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {cols.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-[160px]" />
        </div>
        <div className="space-x-2 flex">
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
    </div>
  )
}