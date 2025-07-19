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
  const [activeView, setActiveView] = useState<string>("grid");
   const [searchParams, setSearchParams] = useSearchParams();
   const defaultView= "grid"
    const viewsSelector = ["grid", "list"]

    const debouncedUpdateUrl = useDebouncedCallback((view: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('viewstyle', view);
      setSearchParams(newParams, { replace: true });
    }, 300);

   useEffect(() => {
      if (!viewsSelector?.length) return;
  
      const urlView = searchParams.get('viewstyle');
      
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
        <Button onClick={()=>setActiveView("grid")}>
          <Grid2x2 />
        </Button>
        <Button onClick={()=>setActiveView("list")}>
          <List />
        </Button>
      </div>
      {activeView=="grid"&& <SchedulerProvider weekStartsOn="monday" initialState={exams}>
        <StudentSchedulerViewFilteration
          stopDayEventSummary={true}
          classNames={{
            tabs: {
              panel: "p-0",
            },
          }}
        />
      </SchedulerProvider>}
      {activeView=="list"&&<StudentExams />}
    </div>
  );
}

export default StudentExamsPage;
