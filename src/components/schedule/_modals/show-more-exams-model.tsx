import React, { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ScrollArea } from "../../scroll-area";
import { Exam } from "../../../pages/exams";
import { Badge } from "../../ui/badge";

export default function ShowMoreExamsModal({ data }: { data: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    setExams(data);
  }, [data]);

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea className="h-[50vh] rounded-md border p-4">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <Badge
              variant={"outline"}
              className="w-full p-2 m-1  rounded flex-grow overflow-hidden font-medium"
            >
              {exam.course} - Group {exam.group}
            </Badge>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarIcon className="h-12 w-12 text-primary mb-2" />
            <p className="text-lg font-medium text-primary">No exam found</p>
            <p className="text-sm text-muted-foreground">
              There are no exams scheduled for this day.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
