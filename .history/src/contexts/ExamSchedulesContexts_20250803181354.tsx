import React, { createContext, useState, ReactNode } from "react";
import type { Event } from "../../types"; 
import { Course } from "../pages/studentExams";
 
 
export interface CourseGroup{
   id:number;
  course:Course;
  group_name:string;
  current_member:number;
  max_member:number;
  created_at:string;
  update_at:string;

}
export interface UnscheduledExamGroup{
  id:string;
  group:CourseGroup;

}
 export interface UnscheduledCourse{
  course:Course;
  groups:[CourseGroup];
}
export interface UnscheduledCourseEnhanced{
  id?:string;
  course:Course,
  groups:UnscheduledExamGroup[]
}
export interface ExamScheduleContextType {
  unScheduled:UnscheduledCourse[];
  setUnScheduled:(unschedules: UnscheduledCourse[]) => void
  exams: Event[];  
  setExams: (exams: Event[]) => void; 
  status?:string,
  setStatus:(status:string)=>void,
  masterTimetable:string,
  setMasterTimetable:(masterTimetable:string)=>void
}

const examScheduleContext= createContext<ExamScheduleContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const ExamscheduleProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [exams, setExams] = useState<Event[]>([]);
  const [unScheduled, setUnScheduled] = useState<UnscheduledCourse[]>([]);  
  const [status, setStatus]= useState<string>("")
  const[masterTimetable, setMasterTimetable]= useState<string>("")

  return (
    <examScheduleContext.Provider value={{ exams, setExams, unScheduled, setUnScheduled, status, setStatus, masterTimetable, setMasterTimetable}}>
      {children}
    </examScheduleContext.Provider>
  );
};

export default examScheduleContext;
