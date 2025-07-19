import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";
import { useTransition } from "react";
import type { Event } from "../../types";
import useUserAxios from "../hooks/useUserAxios";
import useExamsSchedule from "../hooks/useExamShedule";
import { Course } from "../pages/studentExams";
import { Unscheduled } from "../contexts/ExamSchedulesContexts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../components/ui/dialog";

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
  unscheduled:Unscheduled[]
}

const ExamsScheduleLayout: React.FC = () => {
  const {  setExams , unScheduled} = useExamsSchedule();
  const [isGettingExams, startTransition] = useTransition();
  const axios = useUserAxios();
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);

  const getExams = () => {
    startTransition(async () => {
      try {
        const resp = await axios.get("/api/exams/exams");

        const respTyped = resp as { data: ExamsResponse };
        const datas: Event[] = respTyped.data.data.map((ex: any) => {
          const startDate = new Date(`${ex.date}T${ex.start_time}`);
          const endDate = new Date(`${ex.date}T${ex.end_time}`);
          let examEvent: Event = {
            title: ex.group.course.title,
            description: ex.status,
            id: String(ex.id),
            startDate: startDate,
            endDate: endDate,
          };
          return examEvent;
        });

        setExams(datas);
      } catch (error) {
        console.log(error);
      }
    });
  };

  useEffect(() => {
    getExams();
  }, []);

  useEffect(()=>{
    if(unScheduled.length>0){
      setDialogOpen(true)
    }

  }, [unScheduled])
  console.log(unScheduled)

  return isGettingExams ? (
    <div className="flex justify-center">
      <Loader className="animate-spin" />
    </div>
  ) : (

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
      <Outlet />

     <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
            <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
               

              <DialogTitle className="text-l font-bold  leading-tight">
                UnScheduled Exams
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed  text-center">
                Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
              </DialogDescription>
            </DialogHeader>

            {unScheduled.length>0 && (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    

                  <div className="relative">
                     {unScheduled.map((exam, idx)=>{
                      return   <ol key={idx}>
                        {exam.courses.map((c, id)=>{
                        return <li key={id}>
                           {c.courseId}
                           <ol>
                            {c.groups.map((g, id)=>{
                              return <li key={id}>{g}</li>
                            })}
                           </ol>
                           
                           </li>
                      })}
                      </ol>
                     })}
                  </div>
                </div>

               
              </div>
            )}


          </DialogContent>
    </Dialog>
  );
};

export default ExamsScheduleLayout;
