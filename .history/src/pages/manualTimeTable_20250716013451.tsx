import { useEffect, useState, useTransition } from "react"
import useUserAxios from "../hooks/useUserAxios"
import { Course } from "./studentExams";

interface Slot{


    date:string,
    name:string;
    startTime:string;
    endTime:string
}


function ManualTimeTable() {
    const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()
    const [isGettingCourses, startGettingCourseTransition]= useTransition()
    const[timeSlots, setTimeSlots]= useState<Slot[]>([])
    const[courses, setCourses]= useState<Course[]>([])


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
             setTimeSlots(resp.data.data.map((slot:any)=>{
                return {date:slot[0],name:slot[1],startTime:slot[1], endTime:slot[2] }
             }))
        })
    }

   
    const fetchCourses =  () => {
  
  startGettingCourseTransition( async () => {
    
    try {
      const resp = await axios.get("/api/courses/");
      
          setCourses(resp.data.data)
      
    } catch (error) {
      console.log(error)
    } 
  })

}
    useEffect(()=>{
        getPossibleTimeSlots()
        fetchCourses()
    },[])

  return (
    <div>
        {timeSlots.map(slot=>{
            return <div>{slot.name}</div>
        })}
    </div>
  )
}

export default ManualTimeTable