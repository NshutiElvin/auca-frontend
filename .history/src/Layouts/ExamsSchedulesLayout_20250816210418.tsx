import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";
import { useTransition } from "react";
import type { Event } from "../../types";
import useUserAxios from "../hooks/useUserAxios";
import useExamsSchedule from "../hooks/useExamShedule";
import { Course } from "../pages/studentExams";
import LocationContext from "../contexts/LocationContext";

interface CourseGroup{
  max_member:string;
  group_name:string;
  current_member:string;
  course: Course
}
interface ExamApiResponse {
  id: number;
  course: string;
  status: string;
  date: string;
  start_time: string;
  end_time: string;
  group:CourseGroup;
}



export interface ExamsResponse {
  data: ExamApiResponse[];
}

const ExamsScheduleLayout: React.FC = () => {
  const {  setExams , setStatus, setMasterTimetable} = useExamsSchedule();
  const [isGettingExams, startTransition] = useTransition();
  const axios = useUserAxios();
  const{selectedLocation}= useContext(LocationContext)


  const getExams = () => {
    startTransition(async () => {
      try {
        let resp=null;
        if(selectedLocation)
          resp = await axios.get(`/api/exams/exams?location=${selectedLocation.id}`);
        else{
          resp = await axios.get("/api/exams/exams");
        }
        

        const respTyped = resp as { data: ExamsResponse };
        const datas: Event[] = respTyped.data.data.map((ex: any) => {
          const startDate = new Date(`${ex.date}T${ex.start_time}`);
          const endDate = new Date(`${ex.date}T${ex.end_time}`);
          let examEvent: Event = {
            title: `${ex.group.course.title} - Group ${ex.group.group_name}`,
            description: ex.status,
            id: String(ex.id),
            startDate: startDate,
            endDate: endDate,
          };
          return examEvent;
        });
        console.log(resp.data.maskEmail)

        setExams(datas);
        setStatus(resp.data.status)
        setMasterTimetable(resp.data.masterTimetable)
      } catch (error) {
        console.log(error);
      }
    });
  };

  useEffect(() => {
    getExams();
  }, []);

  return isGettingExams ? (
    <div className="flex justify-center">
      <Loader className="animate-spin" />
    </div>
  ) : (
    <Outlet />
  );
};

export default ExamsScheduleLayout;
