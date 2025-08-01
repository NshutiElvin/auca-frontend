//  import React, { useState, useEffect, useTransition, useMemo } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Calendar,
//   Table,
//   MoreHorizontal,
//   Bell,
//   User,
//   X,
//   Loader2,
//   AlertCircle,
//   Filter,
// } from "lucide-react";
// import useUserAxios from "../hooks/useUserAxios";
// import { format, parseISO, addDays, subDays, isToday, isSameDay, set } from "date-fns";
// import { DateRange } from "react-day-picker";

// export type RoomOccupancy = {
//   room_id: number;
//   room_name: string;
//   date: string;
//   start_time: string;
//   end_time: string;
//   exam_id: number;
//   course_code: string;
//   student_count: number;
//   course_title: string;
//   course_semester?: string;
//   course_department?: string;
//   course_group?: string;
//   room_capacity: number;
// };

// type GroupedOccupancy = {
//   room_name: string;
//   date: string;
//   start_time: string;
//   end_time: string;
//   courses: {
//     course_code: string;
//     course_title: string;
//     course_semester?: string;
//     course_department?: string;
//     course_group?: string;
//     exam_id: number;
//     student_count: number;
//   }[];
//   total_students: number;
//   room_capacity: number;
//   duration: string;
// };

// const BlockedBookings = () => {
//   const [data, setData] = useState<RoomOccupancy[]>([]);
//   const [filteredData, setFilteredData] = useState<RoomOccupancy[]>([]);
//   const axios = useUserAxios();
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const [selectedOccupancies, setSelectedOccupancies] = useState<RoomOccupancy[]>([]);
//   const [examsDates, setExamsDates] = useState<Set<string>>(new Set());
//   const [isGettingOccupancies, startTransition] = useTransition();
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [viewMode, setViewMode] = useState<"Calendar" | "Table">("Calendar");
//   const [dateRange, setDateRange] = useState<DateRange | undefined>();
//     const [showFilter, setShowFilter] = useState<boolean>(false);
//   const [filterRoom, setFilterRoom] = useState<string>("");
//   const [filterDepartment, setFilterDepartment] = useState<string>("");
//   const [filterSemester, setFilterSemester] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Extract unique values for filters
//   const uniqueRooms = useMemo(() => [...new Set(data.map(item => item.room_name))], [data]);
//   const uniqueDepartments = useMemo(() => [...new Set(data.map(item => item.course_department).filter(Boolean))], [data]);
//   const uniqueSemesters = useMemo(() => [...new Set(data.map(item => item.course_semester).filter(Boolean))], [data]);

//   // Extract time slots from data
//   const timeSlots = useMemo(() => {
//     const slots = new Set<string>();
//     data.forEach(item => {
//       slots.add(item.start_time.substring(0, 5)); // Get HH:MM format
//     });
//     return Array.from(slots).sort();
//   }, [data]);
// useEffect(() => {
//   if (data.length > 0) {
//     console.log("Raw data sample:", data.slice(0, 3));
//     console.log("Unique dates in data:", [...new Set(data.map(item => item.date))].sort());
//     console.log("Date range filter:", dateRange);
//     console.log("Filtered data count:", filteredData.length);
//     console.log("Selected date:", format(selectedDate, "yyyy-MM-dd"));
//     console.log("Time slots:", timeSlots);
//     console.log("Unique rooms:", uniqueRooms);
//   }
// }, [data, filteredData, dateRange, selectedDate, timeSlots, uniqueRooms]);
// useEffect(() => {
//   let result = [...data];
  
//   if (filterRoom) {
//     result = result.filter(item => item.room_name === filterRoom);
//   }
  
//   if (filterDepartment) {
//     result = result.filter(item => item.course_department === filterDepartment);
//   }
  
//   if (filterSemester) {
//     result = result.filter(item => item.course_semester === filterSemester);
//   }
  
//   // Only apply date range filter if it's set
//   if (dateRange?.from && dateRange?.to) {
//     result = result.filter(item => {
//       const itemDate = parseISO(item.date);
//       return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
//     });
//   }
  
//   setFilteredData(result);
// }, [data, filterRoom, filterDepartment, filterSemester, dateRange]);
//   // Apply filters
//   useEffect(() => {
//     let result = [...data];
    
//     if (filterRoom) {
//       result = result.filter(item => item.room_name === filterRoom);
//     }
    
//     if (filterDepartment) {
//       result = result.filter(item => item.course_department === filterDepartment);
//     }
    
//     if (filterSemester) {
//       result = result.filter(item => item.course_semester === filterSemester);
//     }
    
//     if (dateRange?.from && dateRange?.to) {
//       result = result.filter(item => {
//         const itemDate = parseISO(item.date);
//         return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
//       });
//     }
    
//     setFilteredData(result);
//   }, [data, filterRoom, filterDepartment, filterSemester, dateRange]);

//   const groupedOccupancies = useMemo(() => {
//     if (selectedOccupancies.length === 0) return [];

//     // Group by room and time slot combination
//     const grouped = selectedOccupancies.reduce((acc, occupancy) => {
//       const slotKey = `${occupancy.room_name}_${occupancy.start_time}-${occupancy.end_time}`;

//       if (!acc[slotKey]) {
//         acc[slotKey] = {
//           room_name: occupancy.room_name,
//           date: occupancy.date,
//           start_time: occupancy.start_time,
//           end_time: occupancy.end_time,
//           courses: [],
//           total_students: 0,
//           room_capacity: occupancy.room_capacity,
//         };
//       }

//       acc[slotKey].courses.push({
//         course_code: occupancy.course_code,
//         course_title: occupancy.course_title,
//         course_semester: occupancy.course_semester,
//         course_department: occupancy.course_department,
//         course_group: occupancy.course_group,
//         exam_id: occupancy.exam_id,
//         student_count: occupancy.student_count,
//       });

//       acc[slotKey].total_students += occupancy.student_count;

//       return acc;
//     }, {} as Record<string, any>);

//     return Object.values(grouped)
//       .map((slot: any) => {
//         const startTime = new Date(`2000-01-01 ${slot.start_time}`);
//         const endTime = new Date(`2000-01-01 ${slot.end_time}`);
//         const durationMs = endTime.getTime() - startTime.getTime();
//         const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
//         const durationMinutes = Math.floor(
//           (durationMs % (1000 * 60 * 60)) / (1000 * 60)
//         );

//         let durationText = "";
//         if (durationHours > 0) {
//           durationText = `${durationHours}h`;
//           if (durationMinutes > 0) {
//             durationText += ` ${durationMinutes}min`;
//           }
//         } else {
//           durationText = `${durationMinutes}min`;
//         }

//         return {
//           ...slot,
//           duration: durationText,
//         };
//       })
//       .sort((a, b) => {
//         // Sort by room name first, then by start time
//         if (a.room_name !== b.room_name) {
//           return a.room_name.localeCompare(b.room_name);
//         }
//         return a.start_time.localeCompare(b.start_time);
//       });
//   }, [selectedOccupancies]);

//   const fetchOccupancies = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await axios.get("/api/rooms/occupancies/");
//       const flatData: RoomOccupancy[] = [];
//       const dates = new Set<string>();
      
//       for (const room of resp.data.data) {
//         for (const schedule of room.schedules) {
//           dates.add(schedule.date);
//           for (const exam of schedule.exams) {
//             flatData.push({
//               room_id: room.room_id,
//               room_name: room.room_name,
//               date: schedule.date,
//               start_time: schedule.start_time,
//               end_time: schedule.end_time,
//               exam_id: exam.exam_id,
//               course_code: exam.course_code,
//               student_count: exam.student_count,
//               course_title: exam.course_title,
//               room_capacity: room.room_capacity,
//               course_department: exam.course_department,
//               course_semester: exam.course_semester,
//               course_group: exam.course_group
//             });
//           }
//         }
//       }

//       setData(flatData);
//       setFilteredData(flatData);
//       setExamsDates(dates);
      
//       // Set initial date to the first available date or today
//       if (dates.size > 0) {
//         const firstDate = Array.from(dates).sort()[0];
//         setSelectedDate(parseISO(firstDate));
//       }
//     } catch (error) {
//       console.error("Error fetching occupancies:", error);
//       setError("Failed to load data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   function handleShowRoomOccupancies(roomOccupancy: RoomOccupancy[]) {
//     setSelectedOccupancies(roomOccupancy);
//     setShowModal(true);
//   }

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedOccupancies([]);
//   };

//   const getOccupancyForSlot = (roomName: string, timeSlot: string, date: Date) => {
//     return filteredData.filter(
//       (occupancy) =>
//         occupancy.room_name === roomName &&
//         occupancy.start_time.startsWith(timeSlot.split(":")[0]) &&
//         isSameDay(parseISO(occupancy.date), date)
//     );
//   };

//   const formatTime = (time: string) => {
//     const [hour, minute] = time.split(":");
//     const hourNum = parseInt(hour);
//     const ampm = hourNum >= 12 ? "PM" : "AM";
//     const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
//     return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
//   };

//   const handlePrevDay = () => {
//     setSelectedDate(prev => subDays(prev, 1));
//   };

//   const handleNextDay = () => {
//     setSelectedDate(prev => addDays(prev, 1));
//   };

//   const handleToday = () => {
//     setSelectedDate(new Date());
//   };

  

//   const OccupancyCard = ({ occupancies }: { occupancies: RoomOccupancy[] }) => {
//     const isOvercapacity =
//       occupancies.reduce((sum, occ) => sum + occ.student_count, 0) >
//       (occupancies[0]?.room_capacity || 0);

//     return (
//       <div
//         className={`relative h-12 rounded-md p-2 text-xs cursor-pointer hover:shadow-md transition-shadow ${
//           isOvercapacity
//             ? "bg-red-50 border border-red-200"
//             : "bg-blue-50 border border-blue-200"
//         }`}
//         onClick={() => handleShowRoomOccupancies(occupancies)}
//       >
//         <div className="flex items-center justify-between h-full">
//           <div className="flex-1 min-w-0">
//             <div
//               className={`font-medium truncate ${
//                 isOvercapacity ? "text-red-700" : "text-blue-700"
//               }`}
//             >
//               {occupancies[0]?.course_code || "Multiple Courses"}
//             </div>
//             <div
//               className={`text-xs truncate ${
//                 isOvercapacity ? "text-red-600" : "text-blue-600"
//               }`}
//             >
//               {occupancies.reduce((sum, occ) => sum + occ.student_count, 0)}{" "}
//               students
//             </div>
//           </div>
//           <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
//         </div>
//         {isOvercapacity && (
//           <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
//             <span className="text-white text-xs font-bold">!</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   useEffect(() => {
//     fetchOccupancies();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
//         <span className="ml-2">Loading room occupancies...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="bg-red-50 p-4 rounded-md flex items-start max-w-md">
//           <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
//           <div>
//             <h3 className="text-red-800 font-medium">Error loading data</h3>
//             <p className="text-red-700 mt-1">{error}</p>
//             <button
//               onClick={fetchOccupancies}
//               className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
//   console.log(groupedOccupancies)
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Main Content */}
//       <div>
//         {/* Controls */}
//         <div className="bg-white border-b border-gray-00 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button 
//                 className="p-1 hover:bg-gray-100 rounded"
//                 onClick={handlePrevDay}
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <div className="flex items-center space-x-2">
//                 <button 
//                   className="text-sm text-gray-500 hover:underline"
//                   onClick={handleToday}
//                 >
//                   Today
//                 </button>
//                 <span className="font-medium">
//                   {format(selectedDate, "EEEE d MMMM yyyy")}
//                 </span>
//               </div>
//               <button 
//                 className="p-1 hover:bg-gray-100 rounded"
//                 onClick={handleNextDay}
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <button className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-00" onClick={()=>{
//                     setShowFilter(prev => !prev)
//                 }}>
//                   <Filter className="w-4 h-4" />
//                   <span>Filters</span>
//                 </button>
//                 {showFilter && <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-3 z-10 border border-gray-00">
//                   <div className="space-y-3">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Room
//                       </label>
//                       <select
//                         value={filterRoom}
//                         onChange={(e) => setFilterRoom(e.target.value)}
//                         className="w-full text-sm border border-gray-800 rounded-md px-2 py-1 text-gray-800"
//                       >
//                         <option value="">All Rooms</option>
//                         {uniqueRooms.map(room => (
//                           <option key={room} value={room}>{room}</option>
//                         ))}
//                       </select>
//                     </div>
//                     {uniqueDepartments.length > 0 && (
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           Department
//                         </label>
//                         <select
//                           value={filterDepartment}
//                           onChange={(e) => setFilterDepartment(e.target.value)}
//                           className="w-full text-sm border border-gray-800 rounded-md px-2 py-1 text-gray-800"
//                         >
//                           <option value="">All Departments</option>
//                           {uniqueDepartments.map(dept => (
//                             <option key={dept} value={dept}>{dept}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                     {uniqueSemesters.length > 0 && (
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           Semester
//                         </label>
//                         <select
//                           value={filterSemester}
//                           onChange={(e) => setFilterSemester(e.target.value)}
//                           className="w-full text-sm border border-gray-800 rounded-md px-2 py-1 text-gray-800"
//                         >
//                           <option value="">All Semesters</option>
//                           {uniqueSemesters.map(sem => (
//                             <option key={sem} value={sem}>{sem}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                   </div>
//                 </div>}
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setViewMode("Calendar")}
//                   className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
//                     viewMode === "Calendar"
//                       ? "bg-blue-500 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-00"
//                   }`}
//                 >
//                   <Calendar className="w-4 h-4" />
//                   <span>Calendar</span>
//                 </button>
//                 <button
//                   onClick={() => setViewMode("Table")}
//                   className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
//                     viewMode === "Table"
//                       ? "bg-blue-500 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-00"
//                   }`}
//                 >
//                   <Table className="w-4 h-4" />
//                   <span>Table</span>
//                 </button>
//               </div>

//               <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
//                 <span>{format(new Date(), "HH:mm")}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Calendar Grid */}
//         {viewMode === "Calendar" && (
//           <div className="p-6">
//             <div className="bg-white rounded-lg border border-gray-00 overflow-hidden">
//               {/* Time Header */}
//               <div className="flex border-b border-gray-00">
//                 <div className="w-16 p-3 bg-gray-50 font-medium text-sm text-gray-900 border-r border-gray-00">
//                   Rooms
//                 </div>
//                 {timeSlots.map((time, index) => (
//                   <div
//                     key={index}
//                     className="flex-1 p-3 bg-gray-50 text-center text-sm font-medium text-gray-900 border-r border-gray-00 last:border-r-0"
//                   >
//                     {time}
//                   </div>
//                 ))}
//               </div>

//               {/* Room Rows */}
//               <div className="divide-y divide-gray-00">
//                 {uniqueRooms.map((room) => (
//                   <div key={room} className="flex">
//                     <div className="w-16 p-3 bg-gray-50 flex items-center justify-center border-r border-gray-00">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
//                         <span className="text-sm font-medium text-gray-900">
//                           {room}
//                         </span>
//                       </div>
//                     </div>
//                     {timeSlots.map((time, timeIndex) => {
//                       const occupancies = getOccupancyForSlot(
//                         room,
//                         time,
//                         selectedDate
//                       );
//                       return (
//                         <div
//                           key={timeIndex}
//                           className="flex-1 p-2 border-r border-gray-00 last:border-r-0 min-h-[64px]"
//                         >
//                           {occupancies.length > 0 && (
//                             <OccupancyCard occupancies={occupancies} />
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Table View */}
//         {viewMode === "Table" && (
//           <div className="p-6">
//             <div className="bg-white rounded-lg border border-gray-00 overflow-hidden">
//               <table className="min-w-full divide-y divide-gray-00">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Room
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Duration
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Courses
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Students
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Capacity
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-00">
//                   {groupedOccupancies.map((group: GroupedOccupancy, index) => (
//                     <tr 
//                       key={index} 
//                       className="hover:bg-gray-50 cursor-pointer"
//                       onClick={() => handleShowRoomOccupancies(selectedOccupancies)}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {group.room_name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {format(parseISO(group.date), "MMM d, yyyy")}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {formatTime(group.start_time)} - {formatTime(group.end_time)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {group.duration}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {group.courses.map(c => c.course_code).join(", ")}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {group.total_students}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {group.room_capacity}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Booking Details
//                 </h3>
//                 <button
//                   onClick={handleCloseModal}
//                   className="text-gray-400 hover:text-gray-500"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>
              
//               <div className="mt-4 space-y-4">
//                 {groupedOccupancies.map((group: GroupedOccupancy, index) => (
//                   <div key={index} className="border border-gray-00 rounded-md p-4">
//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <p className="text-sm font-medium text-gray-500">Room</p>
//                         <p className="mt-1 text-sm text-gray-900">{group.room_name}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-500">Date</p>
//                         <p className="mt-1 text-sm text-gray-900">
//                           {format(parseISO(group.date), "EEEE, MMMM d, yyyy")}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-500">Time</p>
//                         <p className="mt-1 text-sm text-gray-900">
//                           {formatTime(group.start_time)} - {formatTime(group.end_time)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-500">Duration</p>
//                         <p className="mt-1 text-sm text-gray-900">{group.duration}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-500">Total Students</p>
//                         <p className="mt-1 text-sm text-gray-900">
//                           {group.total_students} / {group.room_capacity}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <h4 className="text-sm font-medium text-gray-700 mb-2">Courses</h4>
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full divide-y divide-gray-00">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Code
//                             </th>
//                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Title
//                             </th>
//                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Department
//                             </th>
//                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Semester
//                             </th>
//                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                               Students
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-00">
//                           {group.courses.map((course, idx) => (
//                             <tr key={idx}>
//                               <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
//                                 {course.course_code}
//                               </td>
//                               <td className="px-3 py-2 text-sm text-gray-500">
//                                 {course.course_title}
//                               </td>
//                               <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
//                                 {course.course_department || "-"}
//                               </td>
//                               <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
//                                 {course.course_semester || "-"}
//                               </td>
//                               <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
//                                 {course.student_count}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={handleCloseModal}
//                   className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BlockedBookings;




import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Table,
  MoreHorizontal,
  Bell,
  User,
  X,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  Settings,
} from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";

export type RoomOccupancy = {
  room_id: number;
  room_name: string;
  date: string;
  start_time: string;
  end_time: string;
  exam_id: number;
  course_code: string;
  student_count: number;
  course_title: string;
  course_semester?: string;
  course_department?: string;
  course_group?: string;
  room_capacity: number;
};

type FilterOptions = {
  department: string;
  semester: string;
  capacity: string;
  occupancyStatus: string;
};

const BlockedBookings = () => {
  const [data, setData] = useState<RoomOccupancy[]>([]);
  const axios = useUserAxios();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOccupancies, setSelectedOccupancies] = useState<RoomOccupancy[]>([]);
  const [examsDates, setExamsDates] = useState<Set<string>>(new Set());
  const [isGettingOccupancies, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  });
  const [viewMode, setViewMode] = useState<"Calendar" | "Table">("Calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    department: "",
    semester: "",
    capacity: "",
    occupancyStatus: "",
  });
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [rooms, setRooms] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract unique values from data for filters
  const filterOptions = useMemo(() => {
    const departments = [...new Set(data.map(d => d.course_department).filter(Boolean))];
    const semesters = [...new Set(data.map(d => d.course_semester).filter(Boolean))];
    const capacities = [...new Set(data.map(d => d.room_capacity).filter(Boolean))].sort((a, b) => a - b);
    
    return { departments, semesters, capacities };
  }, [data]);

  // Get available dates from API data
  const availableDates = useMemo(() => {
    const dates = Array.from(examsDates).sort();
    return dates.map(dateStr => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    });
  }, [examsDates]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter(occupancy => {
      const matchesSearch = searchTerm === "" || 
        occupancy.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occupancy.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occupancy.room_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filters.department === "" || 
        occupancy.course_department === filters.department;

      const matchesSemester = filters.semester === "" || 
        occupancy.course_semester === filters.semester;

      const matchesCapacity = filters.capacity === "" || 
        occupancy.room_capacity.toString() === filters.capacity;

      const totalStudents = data
        .filter(d => d.room_name === occupancy.room_name && d.start_time === occupancy.start_time)
        .reduce((sum, d) => sum + d.student_count, 0);
      
      const isOvercapacity = totalStudents > occupancy.room_capacity;
      const matchesOccupancyStatus = filters.occupancyStatus === "" ||
        (filters.occupancyStatus === "overcapacity" && isOvercapacity) ||
        (filters.occupancyStatus === "normal" && !isOvercapacity);

      return matchesSearch && matchesDepartment && matchesSemester && 
             matchesCapacity && matchesOccupancyStatus;
    });
  }, [data, searchTerm, filters]);

  const groupedOccupancies = useMemo(() => {
    if (selectedOccupancies.length === 0) return [];

    const grouped = selectedOccupancies.reduce((acc, occupancy) => {
      const slotKey = `${occupancy.room_name}_${occupancy.start_time}-${occupancy.end_time}`;

      if (!acc[slotKey]) {
        acc[slotKey] = {
          room_name: occupancy.room_name,
          date: occupancy.date,
          start_time: occupancy.start_time,
          end_time: occupancy.end_time,
          courses: [],
          total_students: 0,
          room_capacity: occupancy.room_capacity,
        };
      }

      acc[slotKey].courses.push({
        course_code: occupancy.course_code,
        course_title: occupancy.course_title,
        course_semester: occupancy.course_semester,
        course_department: occupancy.course_department,
        course_group: occupancy.course_group,
        exam_id: occupancy.exam_id,
        student_count: occupancy.student_count,
      });

      acc[slotKey].total_students += occupancy.student_count;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .map((slot: any) => {
        const startTime = new Date(`2000-01-01 ${slot.start_time}`);
        const endTime = new Date(`2000-01-01 ${slot.end_time}`);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        let durationText = "";
        if (durationHours > 0) {
          durationText = `${durationHours}h`;
          if (durationMinutes > 0) {
            durationText += ` ${durationMinutes}min`;
          }
        } else {
          durationText = `${durationMinutes}min`;
        }

        return { ...slot, duration: durationText };
      })
      .sort((a, b) => {
        if (a.room_name !== b.room_name) {
          return a.room_name.localeCompare(b.room_name);
        }
        return a.start_time.localeCompare(b.start_time);
      });
  }, [selectedOccupancies]);

  const fetchOccupancies = async () => {
    setLoading(true);
    setError(null);
    startTransition(async () => {
      try {
        const resp = await axios.get("/api/rooms/occupancies/");
        const flatData: RoomOccupancy[] = [];
        let dates: string[] = [];
        let roomSet = new Set<string>();
        let timeSet = new Set<string>();

        for (const room of resp.data.data) {
          roomSet.add(room.room_name);
          for (const schedule of room.schedules) {
            timeSet.add(schedule.start_time);
            dates.push(schedule.date);
            for (const exam of schedule.exams) {
              flatData.push({
                room_id: room.room_id,
                room_name: room.room_name,
                date: schedule.date,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                exam_id: exam.exam_id,
                course_code: exam.course_code,
                student_count: exam.student_count,
                course_title: exam.course_title,
                room_capacity: room.room_capacity,
                course_department: exam.course_department,
                course_semester: exam.course_semester,
                course_group: exam.course_group
              });
            }
          }
        }

        setData(flatData);
        setRooms(Array.from(roomSet).sort());
        setTimeSlots(Array.from(timeSet).sort());
        setExamsDates(new Set(dates));
      } catch (error) {
        console.error("Error fetching occupancies:", error);
        setError("Failed to load room occupancies. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleShowRoomOccupancies = (roomOccupancy: RoomOccupancy[]) => {
    setSelectedOccupancies(roomOccupancy);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOccupancies([]);
  };

  const getOccupancyForSlot = (roomName: string, timeSlot: string) => {
    return filteredData.filter(
      (occupancy) =>
        occupancy.room_name === roomName &&
        occupancy.start_time.startsWith(timeSlot.split(":")[0])
    );
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
      setSelectedDate(availableDates[currentDateIndex - 1]);
    } else if (direction === 'next' && currentDateIndex < availableDates.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
      setSelectedDate(availableDates[currentDateIndex + 1]);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Room', 'Date', 'Time', 'Course Code', 'Course Title', 'Students', 'Capacity', 'Department', 'Semester'],
      ...filteredData.map(d => [
        d.room_name, d.date, `${d.start_time}-${d.end_time}`, d.course_code,
        d.course_title, d.student_count, d.room_capacity, d.course_department, d.course_semester
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-occupancies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOccupancyStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = new Set(filteredData.map(d => d.room_name)).size;
    const totalStudents = filteredData.reduce((sum, d) => sum + d.student_count, 0);
    const overcapacityRooms = filteredData.filter(d => {
      const roomOccupancy = filteredData
        .filter(fd => fd.room_name === d.room_name && fd.start_time === d.start_time)
        .reduce((sum, fd) => sum + fd.student_count, 0);
      return roomOccupancy > d.room_capacity;
    }).length;

    return { totalRooms, occupiedRooms, totalStudents, overcapacityRooms };
  };

  const stats = getOccupancyStats();

  const OccupancyCard = ({ occupancies }: { occupancies: RoomOccupancy[] }) => {
    const totalStudents = occupancies.reduce((sum, occ) => sum + occ.student_count, 0);
    const capacity = occupancies[0]?.room_capacity || 0;
    const isOvercapacity = totalStudents > capacity;
    const utilizationRate = capacity > 0 ? (totalStudents / capacity * 100).toFixed(0) : 0;

    return (
      <div
        className={`relative h-16 rounded-md p-2 text-xs cursor-pointer hover:shadow-md transition-all hover:scale-105 ${
          isOvercapacity
            ? "bg-red-50 border border-red-200 hover:bg-red-100"
            : totalStudents > capacity * 0.8
            ? "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
            : "bg-blue-50 border border-blue-200 hover:bg-blue-100"
        }`}
        onClick={() => handleShowRoomOccupancies(occupancies)}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${
                isOvercapacity ? "text-red-700" : "text-blue-700"
              }`}>
                {occupancies.length === 1 ? occupancies[0].course_code : `${occupancies.length} Courses`}
              </div>
              <div className={`text-xs truncate flex items-center gap-1 ${
                isOvercapacity ? "text-red-600" : "text-blue-600"
              }`}>
                <Users className="w-3 h-3" />
                {totalStudents}/{capacity} ({utilizationRate}%)
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(occupancies[0].start_time)}
          </div>
        </div>
        {isOvercapacity && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchOccupancies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg">Loading room occupancies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchOccupancies}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Total Rooms:</span>
              <span className="font-semibold">{stats.totalRooms}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Occupied:</span>
              <span className="font-semibold">{stats.occupiedRooms}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">Students:</span>
              <span className="font-semibold">{stats.totalStudents}</span>
            </div>
            {stats.overcapacityRooms > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Overcapacity:</span>
                <span className="font-semibold text-red-600">{stats.overcapacityRooms}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={fetchOccupancies}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isGettingOccupancies ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, rooms..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
            >
              <option value="">All Semesters</option>
              {filterOptions.semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
              value={filters.capacity}
              onChange={(e) => setFilters({...filters, capacity: e.target.value})}
            >
              <option value="">All Capacities</option>
              {filterOptions.capacities.map(cap => (
                <option key={cap} value={cap.toString()}>{cap} students</option>
              ))}
            </select>
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
              value={filters.occupancyStatus}
              onChange={(e) => setFilters({...filters, occupancyStatus: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="normal">Normal</option>
              <option value="overcapacity">Overcapacity</option>
            </select>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigateDate('prev')}
              disabled={currentDateIndex === 0}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Date</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <button 
              onClick={() => navigateDate('next')}
              disabled={currentDateIndex === availableDates.length - 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("Calendar")}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                  viewMode === "Calendar"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-800"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setViewMode("Table")}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                  viewMode === "Table"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-800"
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "Calendar" && (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-800">
              <div className="w-20 p-3 bg-gray-50 font-medium text-sm text-gray-900 border-r border-gray-800">
                Rooms
              </div>
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className="flex-1 p-3 bg-gray-50 text-center text-sm font-medium text-gray-900 border-r border-gray-800 last:border-r-0"
                >
                  {formatTime(time)}
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
              {rooms.map((room) => (
                <div key={room} className="flex">
                  <div className="w-20 p-3 bg-gray-50 flex items-center justify-center border-r border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {room}
                      </span>
                    </div>
                  </div>
                  {timeSlots.map((_, timeIndex) => {
                    const occupancies = getOccupancyForSlot(room, timeSlots[timeIndex]);
                    return (
                      <div
                        key={timeIndex}
                        className="flex-1 p-2 border-r border-gray-800 last:border-r-0 min-h-[80px]"
                      >
                        {occupancies.length > 0 && (
                          <OccupancyCard occupancies={occupancies} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "Table" && (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-800">
                  {filteredData.map((occupancy, index) => {
                    const isOvercapacity = occupancy.student_count > occupancy.room_capacity;
                    return (
                      <tr key={index} className={isOvercapacity ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isOvercapacity ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overcapacity
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900">Room Occupancy Details</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {groupedOccupancies.map((slot, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-lg">Room {slot.room_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)} ({slot.duration})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className={`font-semibold ${
                        slot.total_students > slot.room_capacity ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {slot.total_students} / {slot.room_capacity} students
                      </span>
                      {slot.total_students > slot.room_capacity && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {slot.courses.map((course: any, courseIndex: number) => (
                      <div key={courseIndex} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-blue-700">{course.course_code}</span>
                              <span className="text-gray-600">{course.course_title}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              {course.course_department && (
                                <span>Department: {course.course_department}</span>
                              )}
                              {course.course_semester && (
                                <span>Semester: {course.course_semester}</span>
                              )}
                              {course.course_group && (
                                <span>Group: {course.course_group}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{course.student_count} students</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {slot.total_students > slot.room_capacity && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">Overcapacity Warning</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        This room is overcapacity by {slot.total_students - slot.room_capacity} students. 
                        Consider moving some exams to larger rooms or different time slots.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-800 rounded-md"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const modalData = groupedOccupancies.map(slot => ({
                    room: slot.room_name,
                    time: `${slot.start_time}-${slot.end_time}`,
                    total_students: slot.total_students,
                    capacity: slot.room_capacity,
                    courses: slot.courses.map((c: any) => `${c.course_code} (${c.student_count})`).join(', ')
                  }));
                  
                  const csvContent = [
                    ['Room', 'Time', 'Total Students', 'Capacity', 'Courses'],
                    ...modalData.map(d => [d.room, d.time, d.total_students, d.capacity, d.courses])
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `room-details-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedBookings; 