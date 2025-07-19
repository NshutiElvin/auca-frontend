import { StudentExams } from "./studentExams"
import SchedulerWrapper from "../components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import useExamsSchedule from "../hooks/useExamShedule";

function StudentExamsPage() {
     const {exams}= useExamsSchedule()
  return (
    <div><StudentExams/></div>
  )
}

export default StudentExamsPage