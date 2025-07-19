import { useTransition } from "react"
import useUserAxios from "../hooks/useUserAxios"

function ManualTimeTable() {
    const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
            console.log(resp.data)
        })
    }

  return (
    <div>manualTimeTable</div>
  )
}

export default ManualTimeTable