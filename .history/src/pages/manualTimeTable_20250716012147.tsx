import { useEffect, useState, useTransition } from "react"
import useUserAxios from "../hooks/useUserAxios"

function ManualTimeTable() {
    const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()
    const[timeSlots, setTimeSlots]= useState([])


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
             setTimeSlots(resp.data.data)
        })
    }

    useEffect(()=>{
        getPossibleTimeSlots()
    },[])

  return (
    <div>
        {timeSlots}
    </div>
  )
}

export default ManualTimeTable