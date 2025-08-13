import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictedCourses: string[];
  conflictedStudents: any[];
}

export function ConflictDialog({
  open,
  onOpenChange,
  conflictedCourses,
  conflictedStudents,
}: ConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight text-center text-gray-900 dark:text-gray-100">
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400">
                Conflicts
              </h4>
              {conflictedCourses.length > 1 && (
                <div className="text-sm font-normal text-gray-700 dark:text-gray-300 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {conflictedCourses[0]}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">VS</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {conflictedCourses[1]}
                  </span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750">
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">
                  Reg No
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">
                  Name
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">
                  Department
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflictedStudents.map((student, index) => (
                <TableRow 
                  key={student.id}
                  className={`
                    border-b border-gray-200 dark:border-gray-700 
                    hover:bg-gray-50 dark:hover:bg-gray-800 
                    transition-colors duration-150
                    ${index % 2 === 0 
                      ? 'bg-white dark:bg-gray-900' 
                      : 'bg-gray-25 dark:bg-gray-850'
                    }
                  `}
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {student.reg_no}
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    {student.user.first_name} {student.user.last_name}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {student.user.email}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {student.department.name}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Optional: Add a footer with conflict count */}
        {conflictedStudents.length > 0 && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total conflicts: 
              <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1">
                {conflictedStudents.length}
              </span>
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}