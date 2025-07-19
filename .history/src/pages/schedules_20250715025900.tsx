import SchedulerWrapper from "../components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import useExamsSchedule from "../hooks/useExamShedule";
 
export function SchedulesPage() {

  const {exams}= useExamsSchedule()
  

  return (<div className="w-full">
        <SchedulerProvider weekStartsOn="monday"  initialState={exams}>
      <SchedulerWrapper 
        stopDayEventSummary={true}
        classNames={{
          tabs: {
            panel: "p-0",
          },
        }}
      />
    </SchedulerProvider>
    </div>
  )
}
