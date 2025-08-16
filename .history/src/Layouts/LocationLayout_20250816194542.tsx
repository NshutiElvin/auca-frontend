import { useContext, useEffect } from "react"
import LocationContext from "../contexts/LocationContext"
import useUserAxios from "../hooks/useUserAxios"
import { Outlet } from "react-router-dom"

function LocationLayout() {
    const{locations, setLocations}= useContext(LocationContext)
    const axios= useUserAxios()
    const getLocations=async()=>{
        try {
            const resp= await axios.get("/api/rooms/locations")
            if(resp.data.success){
                setLocations(resp.data.data.map((l:any)=>{
                    return {...l, selected:false}
                }))
            }
            
        } catch (error) {

            
        }

    }
    useEffect(()=>{
        getLocations()
    },[])
  return <Outlet/>
}

export default LocationLayout