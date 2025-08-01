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
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { format, parseISO, addDays, subDays, isToday, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

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

type GroupedOccupancy = {
  room_name: string;
  date: string;
  start_time: string;
  end_time: string;
  courses: {
    course_code: string;
    course_title: string;
    course_semester?: string;
    course_department?: string;
    course_group?: string;
    exam_id: number;
    student_count: number;
  }[];
  total_students: number;
  room_capacity: number;
  duration: string;
};

const BlockedBookings = () => {
  const [data, setData] = useState<RoomOccupancy[]>([]);
  const [filteredData, setFilteredData] = useState<RoomOccupancy[]>([]);
  const axios = useUserAxios();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOccupancies, setSelectedOccupancies] = useState<RoomOccupancy[]>([]);
  const [examsDates, setExamsDates] = useState<Set<string>>(new Set());
  const [isGettingOccupancies, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"Calendar" | "Table">("Calendar");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 6),
  });
  const [filterRoom, setFilterRoom] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extract unique values for filters
  const uniqueRooms = useMemo(() => [...new Set(data.map(item => item.room_name))], [data]);
  const uniqueDepartments = useMemo(() => [...new Set(data.map(item => item.course_department).filter(Boolean))], [data]);
  const uniqueSemesters = useMemo(() => [...new Set(data.map(item => item.course_semester).filter(Boolean))], [data]);

  // Extract time slots from data
  const timeSlots = useMemo(() => {
    const slots = new Set<string>();
    data.forEach(item => {
      slots.add(item.start_time.substring(0, 5)); // Get HH:MM format
    });
    return Array.from(slots).sort();
  }, [data]);

  // Apply filters
  useEffect(() => {
    let result = [...data];
    
    if (filterRoom) {
      result = result.filter(item => item.room_name === filterRoom);
    }
    
    if (filterDepartment) {
      result = result.filter(item => item.course_department === filterDepartment);
    }
    
    if (filterSemester) {
      result = result.filter(item => item.course_semester === filterSemester);
    }
    
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(item => {
        const itemDate = parseISO(item.date);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    }
    
    setFilteredData(result);
  }, [data, filterRoom, filterDepartment, filterSemester, dateRange]);

  const groupedOccupancies = useMemo(() => {
    if (selectedOccupancies.length === 0) return [];

    // Group by room and time slot combination
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
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        let durationText = "";
        if (durationHours > 0) {
          durationText = `${durationHours}h`;
          if (durationMinutes > 0) {
            durationText += ` ${durationMinutes}min`;
          }
        } else {
          durationText = `${durationMinutes}min`;
        }

        return {
          ...slot,
          duration: durationText,
        };
      })
      .sort((a, b) => {
        // Sort by room name first, then by start time
        if (a.room_name !== b.room_name) {
          return a.room_name.localeCompare(b.room_name);
        }
        return a.start_time.localeCompare(b.start_time);
      });
  }, [selectedOccupancies]);

  const fetchOccupancies = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get("/api/rooms/occupancies/");
      const flatData: RoomOccupancy[] = [];
      const dates = new Set<string>();
      
      for (const room of resp.data.data) {
        for (const schedule of room.schedules) {
          dates.add(schedule.date);
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
      setFilteredData(flatData);
      setExamsDates(dates);
      
      // Set initial date to the first available date or today
      if (dates.size > 0) {
        const firstDate = Array.from(dates).sort()[0];
        setSelectedDate(parseISO(firstDate));
      }
    } catch (error) {
      console.error("Error fetching occupancies:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function handleShowRoomOccupancies(roomOccupancy: RoomOccupancy[]) {
    setSelectedOccupancies(roomOccupancy);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOccupancies([]);
  };

  const getOccupancyForSlot = (roomName: string, timeSlot: string, date: Date) => {
    return filteredData.filter(
      (occupancy) =>
        occupancy.room_name === roomName &&
        occupancy.start_time.startsWith(timeSlot.split(":")[0]) &&
        isSameDay(parseISO(occupancy.date), date)
    );
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const OccupancyCard = ({ occupancies }: { occupancies: RoomOccupancy[] }) => {
    const isOvercapacity =
      occupancies.reduce((sum, occ) => sum + occ.student_count, 0) >
      (occupancies[0]?.room_capacity || 0);

    return (
      <div
        className={`relative h-12 rounded-md p-2 text-xs cursor-pointer hover:shadow-md transition-shadow ${
          isOvercapacity
            ? "bg-red-50 border border-red-200"
            : "bg-blue-50 border border-blue-200"
        }`}
        onClick={() => handleShowRoomOccupancies(occupancies)}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 min-w-0">
            <div
              className={`font-medium truncate ${
                isOvercapacity ? "text-red-700" : "text-blue-700"
              }`}
            >
              {occupancies[0]?.course_code || "Multiple Courses"}
            </div>
            <div
              className={`text-xs truncate ${
                isOvercapacity ? "text-red-600" : "text-blue-600"
              }`}
            >
              {occupancies.reduce((sum, occ) => sum + occ.student_count, 0)}{" "}
              students
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
        {isOvercapacity && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Loading room occupancies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 p-4 rounded-md flex items-start max-w-md">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          <div>
            <h3 className="text-red-800 font-medium">Error loading data</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchOccupancies}
              className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div>
        {/* Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="p-1 hover:bg-gray-100 rounded"
                onClick={handlePrevDay}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  className="text-sm text-gray-500 hover:underline"
                  onClick={handleToday}
                >
                  Today
                </button>
                <span className="font-medium">
                  {format(selectedDate, "EEEE d MMMM yyyy")}
                </span>
              </div>
              <button 
                className="p-1 hover:bg-gray-100 rounded"
                onClick={handleNextDay}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-3 z-10 border border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <select
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="">All Rooms</option>
                        {uniqueRooms.map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                    {uniqueDepartments.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="">All Departments</option>
                          {uniqueDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {uniqueSemesters.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Semester
                        </label>
                        <select
                          value={filterSemester}
                          onChange={(e) => setFilterSemester(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="">All Semesters</option>
                          {uniqueSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("Calendar")}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    viewMode === "Calendar"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode("Table")}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    viewMode === "Table"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Table</span>
                </button>
              </div>

              <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
                <span>{format(new Date(), "HH:mm")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {viewMode === "Calendar" && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Time Header */}
              <div className="flex border-b border-gray-200">
                <div className="w-16 p-3 bg-gray-50 font-medium text-sm text-gray-900 border-r border-gray-200">
                  Rooms
                </div>
                {timeSlots.map((time, index) => (
                  <div
                    key={index}
                    className="flex-1 p-3 bg-gray-50 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Room Rows */}
              <div className="divide-y divide-gray-200">
                {uniqueRooms.map((room) => (
                  <div key={room} className="flex">
                    <div className="w-16 p-3 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {room}
                        </span>
                      </div>
                    </div>
                    {timeSlots.map((time, timeIndex) => {
                      const occupancies = getOccupancyForSlot(
                        room,
                        time,
                        selectedDate
                      );
                      return (
                        <div
                          key={timeIndex}
                          className="flex-1 p-2 border-r border-gray-200 last:border-r-0 min-h-[64px]"
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedOccupancies.map((group: GroupedOccupancy, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleShowRoomOccupancies(selectedOccupancies)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.room_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(group.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(group.start_time)} - {formatTime(group.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.duration}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {group.courses.map(c => c.course_code).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.total_students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.room_capacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                {groupedOccupancies.map((group: GroupedOccupancy, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Room</p>
                        <p className="mt-1 text-sm text-gray-900">{group.room_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(parseISO(group.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Time</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatTime(group.start_time)} - {formatTime(group.end_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="mt-1 text-sm text-gray-900">{group.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {group.total_students} / {group.room_capacity}
                        </p>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Courses</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Semester
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Students
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.courses.map((course, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {course.course_code}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-500">
                                {course.course_title}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {course.course_department || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {course.course_semester || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {course.student_count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedBookings;