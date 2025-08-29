import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";
import { useTransition } from "react";
import type { Event } from "../../types";
import useUserAxios from "../hooks/useUserAxios";
import useExamsSchedule from "../hooks/useExamShedule";
import { Course } from "../pages/studentExams";
import LocationContext from "../contexts/LocationContext";
import useSocket from "../hooks/useSockets";
import { RealTimeExamData } from "../contexts/ExamSchedulesContexts";

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
  const {  setExams , setStatus, setMasterTimetable, setCurrentExamData} = useExamsSchedule();
  const [isGettingExams, startTransition] = useTransition();
  const axios = useUserAxios();
  const{selectedLocation}= useContext(LocationContext)
  const{connectWebSocket}= useSocket()
  

  useEffect(() => {
    const socket=connectWebSocket("/ws/exams/");
    socket.onmessage = (event: MessageEvent) => {
      console.log(event)
      try {
        const examData: RealTimeExamData = JSON.parse(event.data);
        if (examData.student) {
          
               setCurrentExamData( examData);

        }
      } catch (e) {
        console.log(e)
         
      }
    };

    return () => {
      socket?.close();  
    };
  }, []);

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
   useEffect(() => {
    getExams();
  }, [selectedLocation]);


  return <>{isGettingExams ? (
    <div className="flex justify-center">
      <Loader className="animate-spin" />
    </div>
  ) : (
    <Outlet />
  )}</>
};

export default ExamsScheduleLayout;
