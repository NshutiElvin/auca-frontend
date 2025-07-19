 import { useState, useEffect, useTransition } from "react";
import { Search, Clock, Calendar, X } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Course } from "./studentExams";
import { Input } from "../components/ui/input";

 

interface Slot {
  id: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface AssignedCourse extends Course {
  slotId: string;
}

function ManualTimeTable() {
 
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null);
      const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()
    const [isGettingCourses, startGettingCourseTransition]= useTransition()
    const[timeSlots, setTimeSlots]= useState<Slot[]>([])
    const[courses, setCourses]= useState<Course[]>([])


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
             setTimeSlots(resp.data.data.map((slot:any, idx:number)=>{
                return {id: idx,date:slot[0],name:slot[1],startTime:slot[1], endTime:slot[2] }
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
   

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCourses = filteredCourses.filter(course =>
    !assignedCourses.some(assigned => assigned.id === course.id)
  );

  const handleDragStart = (e: React.DragEvent, course: Course) => {
    setDraggedCourse(course);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    if (draggedCourse) {
        const isCourseOccupied=assignedCourses.some(course=>course.id==draggedCourse.id)
      const isSlotOccupied = assignedCourses.some(assigned => assigned.slotId === slotId);
    //   if (isSlotOccupied) {
    //     alert("This time slot is already occupied!");
    //     return;
    //   }
    if (isCourseOccupied) {
        alert("This course is already scheduled!");
        return;
      }

      // Remove course from previous slot if it was already assigned
      const updatedAssignments = assignedCourses.filter(assigned => assigned.id !== draggedCourse.id);
      
      // Add course to new slot
      const newAssignment: AssignedCourse = {
        ...draggedCourse,
        slotId: slotId
      };
      
      setAssignedCourses([...updatedAssignments, newAssignment]);
      setDraggedCourse(null);
    }
  };

  const removeCourseFromSlot = (courseId: number) => {
    setAssignedCourses(assignedCourses.filter(assigned => assigned.id !== courseId));
  };

  const getCourseForSlot = (slotId: string) => {
    return assignedCourses.find(assigned => assigned.slotId === slotId);
  };

  // Get unique dates from time slots
  const uniqueDates = [...new Set(timeSlots.map(slot => slot.date))];

   useEffect(()=>{
        getPossibleTimeSlots()
        fetchCourses()
    },[])

  return (
    <div >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-md shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Available Courses</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, course)}
                  className="p-3  rounded-lg border border-gray-200 hover:opacity-45 hover:border-blue-300 cursor-move transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{course.title}</h3>
                      <p className="text-lg">{course.department.name}</p>
                      {course.code && (
                        <span className="text-xs text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                          {course.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="grid grid-cols-3 w-full gap-2 lg:col-span-2">
          
            {uniqueDates.map((date) => {
              const slotsForDate = timeSlots.filter(slot => slot.date === date);
              
              return (
                <div key={date}  className="border-2 border-gray-300 rounded-md overflow-hidden shadow-sm">
                  {/* Date Header */}
                  <div className="text-center mb-1">
                    <h2 className="text-lg font-bold">{date}</h2>
                  </div>
                  
                  {/* Time Slots */}
                  <div>
                    {slotsForDate.map((slot) => {
                      const assignedCourse = getCourseForSlot(slot.id);
                      const slotCourses=assignedCourses.filter(course=>course.slotId==slot.id)
                      
                      return (
                        <div
                          key={slot.id}
                         
                        >
                          {/* Time Period Header */}
                          <div className="p-2 text-center border-b border-gray-300">
                            <h3 className="text-lg font-bold">{slot.name}</h3>
                            {/* <p className="text-sm">{slot.startTime} - {slot.endTime}</p> */}
                          </div>
                          
                          {/* Course Drop Zone */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, slot.id)}
                            className={`
                              min-h-24 p-4 transition-all duration-200
                              ${assignedCourse 
                                ? '' 
                                : 'border-2 border-dashed border-gray-400 hover:border-blue-400 hover:opacity-40'
                              }
                            `}
                          >
                            {assignedCourse ? (
                              <div className="rounded-lg p-1 shadow-sm border border-blue-200">
                                <div className="flex justify-between">
                                    <div className="bg-blue-600 p-2 rounded-sm">{slotCourses.length}</div>
                                <button
                                    onClick={() => removeCourseFromSlot(assignedCourse.id)}
                                    className="text-red-500 hover:text-red-400 ml-2 p-1 rounded hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                 
                                
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    {/* <h4 className="font-semibold">{assignedCourse.title}</h4> */}
                                    {/* <p className="text-sm mt-1">{assignedCourse.department.name}</p> */}
                                    {assignedCourse.code && (
                                      <span className="text-xs  p-1 rounded mt-2 inline-block">
                                        {assignedCourse.code}
                                      </span>
                                    )}
                                  </div>
                                 
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-2">
                                <Calendar className="w-4 h-4 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Drag course here</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          
        </div>
      </div>
 
    </div>
  );
}

export default ManualTimeTable;