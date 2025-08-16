import { X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useState, useMemo } from "react";
import { Badge } from "../components/ui/badge";


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
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return conflictedStudents;
    
    const term = searchTerm.toLowerCase();
    return conflictedStudents.filter(student => 
      student.reg_no.toLowerCase().includes(term) ||
      `${student.user.first_name} ${student.user.last_name}`.toLowerCase().includes(term) ||
      student.user.email.toLowerCase().includes(term) ||
      student.department.name.toLowerCase().includes(term)
    );
  }, [conflictedStudents, searchTerm]);

  // Reset search when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px]   border p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight text-center ">
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400">
                Conflicts
              </h4>
              {conflictedCourses.length > 1 && (
                <div className="text-sm font-normal mt-1">
                  <span className=" font-bold">
                    {conflictedCourses[0]}
                  </span>
                  <span className="font-bold mx-2">VS</span>
                  <span className="font-bold">
                    {conflictedCourses[1]}
                  </span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4 mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2   h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, reg no, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted" >
              <TableRow className="border-b    dark:hover:bg-gray-750">
                <TableHead className=" font-semibold">
                  Reg No
                </TableHead>
                <TableHead className=" font-semibold">
                  Name
                </TableHead>
                <TableHead className=" font-semibold">
                  Email
                </TableHead>
                <TableHead className=" font-semibold">
                  Department
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className=" ">
                      {searchTerm ? (
                        <>
                          <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p>No students found matching "{searchTerm}"</p>
                          <p className="text-sm mt-1">Try adjusting your search terms</p>
                        </>
                      ) : (
                        <p>No conflicted students found</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id}
                    className={`
                      border-b   
                      
                      transition-colors duration-150
                 
                    `}
                  >
                    <TableCell className="font-medium  ">
                      {student.reg_no}
                    </TableCell>
                    <TableCell className=" ">
                      {student.user.first_name} {student.user.last_name}
                    </TableCell>
                    <TableCell className=" ">
                      {student.user.email}
                    </TableCell>
                    <TableCell className="  ">
                      <Badge  variant={"default"}>
                        {student.department.name}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with conflict count and search results */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            {searchTerm ? (
              <>
                Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredStudents.length}</span> of{' '}
                <span className="font-semibold">{conflictedStudents.length}</span> students
              </>
            ) : (
              <>
                Total conflicts: 
                <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1">
                  {conflictedStudents.length}
                </span>
              </>
            )}
          </div>
          
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear search
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}