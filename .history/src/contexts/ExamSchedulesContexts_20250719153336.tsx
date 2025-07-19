import React, { createContext, useState, ReactNode } from "react";
import type { Event } from "../../types"; 
 export interface Unscheduled{
  courseId:string;
  groups:[string];
}

export interface ExamScheduleContextType {
  unScheduled:Unscheduled[];
  setUnScheduled?:(unschedules: Unscheduled[]) => void
  exams: Event[];  
  setExams: (exams: Event[]) => void; 
}

const examScheduleContext= createContext<ExamScheduleContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const ExamscheduleProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [exams, setExams] = useState<Event[]>([]);
  const [unScheduled, setUnScheduled] = useState<Unscheduled[]>([]);  

  return (
    <examScheduleContext.Provider value={{ exams, setExams, unScheduled, setUnScheduled}}>
      {children}
    </examScheduleContext.Provider>
  );
};

export default examScheduleContext;
