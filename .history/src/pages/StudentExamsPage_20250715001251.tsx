import { StudentExams } from "./studentExams"
import StudentSchedulerViewFilteration from "../components/schedule/_components/view/student-schedular-view-filteration.tsxschedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import useExamsSchedule from "../hooks/useExamShedule";

function StudentExamsPage() {
     const {exams}= useExamsSchedule()
  return (
    <div>
         <SchedulerProvider weekStartsOn="monday"  initialState={exams}>
              <StudentSchedulerViewFilteration 
                stopDayEventSummary={true}
                classNames={{
                  tabs: {
                    panel: "p-0",
                  },
                }}
              />
            </SchedulerProvider>
        <StudentExams/>
    </div>
  )
}

export default StudentExamsPage