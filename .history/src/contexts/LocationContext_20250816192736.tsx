import { createContext, useState, useCallback, useEffect } from "react";
import type { PropsWithChildren } from "react";

export interface LocationData {
  id: number;
  name: string;
  selected:boolean;
  
}

interface LocationContextType {
  locations: LocationData[];
  setLocations: (data: LocationData[] | ((prev: LocationData[]) => LocationData[])) => void;
 
}

const LocationContext = createContext<LocationContextType>({
  locations: [],
  setLocations: () => {},
});

export const LocationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [locations, setLocation] = useState<LocationData[]>([]);
  const[selectedLocation, setSelectedLocation]= useState<LocationData|null>(null)
  
 
  useEffect(()=>{
    if(locations){
        const selected= locations.filter(location=>location.selected===true)[0]
        selected?setSelectedLocation(selected):setSelectedLocation(null)
    }

  },[locations])
  const setLocations = useCallback(
    (data: LocationData[] | ((prev: LocationData[]) => LocationData[])) => {
      if (typeof data === 'function') {
        setLocation(data);
      } else {
        setLocation(data);
      }
    },
    []
  );

  return (
    <LocationContext.Provider
      value={{
        locations,
        setLocations,
      
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;