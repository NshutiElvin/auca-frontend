import { useEffect, useState, useTransition } from "react"
import useUserAxios from "../hooks/useUserAxios"

interface Slot{


    date:string,
    name:string;
    startTime:string;
    endTime:string
}


function ManualTimeTable() {
    const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()
    const[timeSlots, setTimeSlots]= useState<Slot[]>([])


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
             setTimeSlots(resp.data.data.map((slot:any)=>{
                return {date:slot[0],name:slot[1],startTime:slot[1], endTime:slot[2] }
             }))
        })
    }

    useEffect(()=>{
        getPossibleTimeSlots()
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