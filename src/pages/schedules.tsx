import SchedulerWrapper from "../components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "../../providers/schedular-provider";
import { useEffect, useState } from "react";
import useUserAxios from "../hooks/useUserAxios";
import type { Event } from "../../types"; 
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
  const getExams= async()=>{
    try {
      const resp= await  axios.get("/api/exams/")
      
      const respTyped = resp as { data: ExamsResponse };
      const datas: Event[] = respTyped.data.data.map((ex: ExamApiResponse) => {
        const startDate = new Date(`${ex.date}T${ex.start_time}`);
        const endDate = new Date(`${ex.date}T${ex.end_time}`);
        let examEvent: Event = {
          title: String(ex.course),
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
  }

  useEffect(()=>{
    getExams()
  },[])

  return (
    <div className="w-full">
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
