import { StudentExams } from "./studentExams";
import StudentSchedulerViewFilteration from "../components/schedule/_components/view/student-schedular-view-filteration.tsxschedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import useExamsSchedule from "../hooks/useExamShedule";
import { Button } from "../components/ui/button";
import { Grid2x2, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

function StudentExamsPage() {
  const { exams } = useExamsSchedule();
  const [activeView, setActiveView] = useState<string>("month");
   const [searchParams, setSearchParams] = useSearchParams();
   const defaultView= "grid"
    const viewsSelector = ["grid", "list"]

    const debouncedUpdateUrl = useDebouncedCallback((view: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('view', view);
      setSearchParams(newParams, { replace: true });
    }, 300);

   useEffect(() => {
      if (!viewsSelector?.length) return;
  
      const urlView = searchParams.get('view');
      
      if (urlView && viewsSelector.includes(urlView)) {
        setActiveView(urlView);
      } else {
        setActiveView(defaultView);
        debouncedUpdateUrl(defaultView);
      }
    }, [viewsSelector, searchParams]);
  return (
    <div>
      <div className="flex gap-1 py-2">
        <Button>
          <Grid2x2 />
        </Button>
        <Button>
          <List />
        </Button>
      </div>
      <SchedulerProvider weekStartsOn="monday" initialState={exams}>
        <StudentSchedulerViewFilteration
          stopDayEventSummary={true}
          classNames={{
            tabs: {
              panel: "p-0",
            },
          }}
        />
      </SchedulerProvider>
      <StudentExams />
    </div>
  );
}

export default StudentExamsPage;
