 import { useState, useEffect, useTransition } from "react";
import { Search, Clock, Calendar, X } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Input } from "../components/ui/input";

interface Course {
  id: string;
  title: string;
  department: {
    name: string;
  };
  code?: string;
  credits?: number;
}

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
      const axios= useUserAxios()
    const [isGettingTimeSlots, startGettingTimeSlotTransition]= useTransition()
    const [isGettingCourses, startGettingCourseTransition]= useTransition()
    const[timeSlots, setTimeSlots]= useState<Slot[]>([])
    const[courses, setCourses]= useState<Course[]>([])


    const getPossibleTimeSlots= ()=>{
        startGettingTimeSlotTransition(async()=>{
            const resp= await axios.get("api/schedules/slots")
             setTimeSlots(resp.data.data.map((slot:any)=>{
                return {date:slot[0],name:slot[1],startTime:slot[1], endTime:slot[2] }
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
  

  const [searchTerm, setSearchTerm] = useState("");
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null);

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

  const handleDrop = (e: React.DragEvent, slotId: string, timeField?: 'startTime' | 'endTime') => {
    e.preventDefault();
    if (draggedCourse) {
      // Check if slot is already occupied
      const isSlotOccupied = assignedCourses.some(assigned => assigned.slotId === slotId);
      if (isSlotOccupied) {
        alert("This time slot is already occupied!");
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

  const removeCourseFromSlot = (courseId: string) => {
    setAssignedCourses(assignedCourses.filter(assigned => assigned.id !== courseId));
  };

  const getCourseForSlot = (slotId: string) => {
    return assignedCourses.find(assigned => assigned.slotId === slotId);
  };

  const updateSlotTime = (slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ));
  };
  useEffect(()=>{
        getPossibleTimeSlots()
        fetchCourses()
    },[])
  return (
    <div className="p-2">
       
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Course Search Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-lg p-6 sticky top-6">
               
              
              <div className="relative mb-4">
                 
                <Input
                  type="text"
                  placeholder="Search by course name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border w-full p-2  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-90 overflow-y-auto">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, course)}
                    className="p-2 rounded-md border   hover:opacity-80 hover:border-blue-300 cursor-move transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold  text-sm">{course.title}</h3>
                        <p className="text-xs  mt-1">{course.department.name}</p>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-md shadow-sm p-4">
               
              
              <div className="grid grid-cols-2 gap-4">
                {timeSlots.map((slot) => {
                  const assignedCourse = getCourseForSlot(slot.id);
                  
                  return (
                    <div
                      key={slot.id}
                      className="  border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm"
                    >
                      {/* Day Header */}
                      <div className="p-3 text-center border-b">
                        <h3 className="text-lg font-bold">{slot.name}</h3>
                      </div>
                      
                      {/* Course Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={`
                          min-h-24 p-3 transition-all duration-200
                          ${assignedCourse 
                            ? 'border-gray-600' 
                            : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }
                        `}
                      >
                        {assignedCourse ? (
                          <div className="rounded-lg p-3 shadow-sm border border-blue-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-800">{assignedCourse.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{assignedCourse.department.name}</p>
                                {assignedCourse.code && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                                    {assignedCourse.code}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeCourseFromSlot(assignedCourse.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Drop course here</p>
                          </div>
                        )}
                      </div>
                      
                       
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {assignedCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timetable Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedCourses.map((course) => {
                const slot = timeSlots.find(s => s.id === course.slotId);
                return (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.department.name}</p>
                    <p className="text-sm text-blue-600 mt-1">{slot?.name} ({slot?.startTime} - {slot?.endTime})</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
}

export default ManualTimeTable;