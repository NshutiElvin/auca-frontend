import { useEffect, useState, useTransition } from "react"
import useUserAxios from "../hooks/useUserAxios"

interface Slot{
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
                return {name:slot[0],startTime:slot[1], endTime:slot[2] }
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