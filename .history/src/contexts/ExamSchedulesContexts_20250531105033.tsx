import React, { createContext, useState, ReactNode } from "react";
import type { Event } from "../../types"; 

export interface ExamScheduleContextType {
  exams: Event[];  
  setExams: (exams: Event[]) => void; 
}

const examScheduleContext= createContext<ExamScheduleContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const ExamscheduleProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [exams, setExams] = useState<Event[]>([]); 

  return (
    <examScheduleContext.Provider value={{ exams, setExams}}>
      {children}
    </examScheduleContext.Provider>
  );
};

export default examScheduleContext;
