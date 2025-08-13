import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Conflicts</h4>
              {conflictedCourses.length > 1 && (
                <div className="text-sm font-normal">
                  {conflictedCourses[0]} VS {conflictedCourses[1]}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ring-offset-background focus:ring-ring rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
            >
              <X className="w-3 h-3" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {conflictedStudents.map((student, idx) => (
            <div key={idx} className="p-2 border rounded">
              {JSON.stringify(student)}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}