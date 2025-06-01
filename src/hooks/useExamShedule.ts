import { useContext } from "react";
import examScheduleContext, {ExamScheduleContextType} from "../contexts/ExamSchedulesContexts";

const useExamsSchedule = (): ExamScheduleContextType => {
  const context = useContext(examScheduleContext);
  if (!context) {
    throw new Error("useExamsSchedule must be used within an Exams schedule context");
  }
  return context;
};

export default useExamsSchedule;
