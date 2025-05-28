import SchedulerWrapper from "../components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import { useEffect, useState, useTransition } from "react";
import useUserAxios from "../hooks/useUserAxios";
import type { Event } from "../../types"; 
import { Loader } from "lucide-react";
   interface ExamApiResponse {
        id: number;
        course: string;
        status: string;
        date: string;
        start_time:string;
        end_time:string;
      }

      interface ExamsResponse {
        data: ExamApiResponse[];
      }

export function SchedulesPage() {
  const axios= useUserAxios()

  const [exams, setExams]= useState<Event[]>([])
  const[isGettingExams,startTransition]= useTransition()
 
  const getExams= ()=>{
    startTransition(async()=>{
    try {
      const resp= await  axios.get("/api/exams/exams")
      
      const respTyped = resp as { data: ExamsResponse };
      const datas: Event[] = respTyped.data.data.map((ex: any) => {
        const startDate = new Date(`${ex.date}T${ex.start_time}`);
        const endDate = new Date(`${ex.date}T${ex.end_time}`);
        let examEvent: Event = {
          title: ex.course.title,
          description: ex.status,
          id: String(ex.id),
          startDate: startDate,
          endDate: endDate
        };
        return examEvent;
      });
      
      setExams(datas)
    } catch (error) {
      console.log(error)
      
    }
  })
  }

  useEffect(()=>{
    getExams()
  },[])

  return (
  isGettingExams?<div className="flex justify-center"><Loader className="animate-spin"/></div>:  <div className="w-full">
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
