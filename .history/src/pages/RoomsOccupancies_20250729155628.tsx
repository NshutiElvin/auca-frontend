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

const BlockedBookings = () => {
  const [data, setData] = useState<RoomOccupancy[]>([]);
  const axios= useUserAxios()
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOccupancies, setSelectedOccupancies] = useState<
    RoomOccupancy[]
  >([]);
  const [examsDates, setExamsDates] = useState<Set<string>>(new Set());
  const [isGettingOccupancies, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState("Tuesday 13 May 2025");
  const [viewMode, setViewMode] = useState("Calendar");

  const daysOfWeek: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const timeSlots = [
    "08:00",
     
    "11:00",
    "12:00",
    "13:00",
     
    "16:00",
    "18:00",
    "20:00",
  ];

  const rooms = [
    "101",
    "102",
    "103",
    "104",
    "105",
    "106",
    "107",
    "108",
    "109",
    "110",
  ];

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

  // Mock function to simulate useUserAxios
  const fetchOccupancies = () => {
    startTransition(async () => {
      try {
        const resp = await axios.get("/api/rooms/occupancies/");
        const flatData: RoomOccupancy[] = [];
        let dates = [];
        for (const room of resp.data.data) {
          for (const schedule of room.schedules) {
            for (const exam of schedule.exams) {
              dates.push(schedule.date);
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
                course_department:exam.course_department,
                course_semester:exam.course_semester,
                course_group:exam.course_group
              });
            }
          }
        }

        setData(flatData);

        setExamsDates(new Set(dates));
      } catch (error) {
        console.error("Error fetching occupancies:", error);
      }
    });
  };

  function handleShowRoomOccupancies(roomOccupancy: RoomOccupancy[]) {
    setSelectedOccupancies(roomOccupancy);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOccupancies([]);
  };

  const getOccupancyForSlot = (roomName: string, timeSlot: string) => {
    return data.filter(
      (occupancy) =>
        occupancy.room_name === roomName &&
        occupancy.start_time.startsWith(timeSlot.split(":")[0])
    );
  };

  const formatTime = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    const minute = time.split(":")[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Main Content */}
      <div  >
 

        {/* Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Today</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                <option>Single Rooms</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("Calendar")}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    viewMode === "Calendar"
                      ? "bg-red-500 text-white"
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
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Table</span>
                </button>
              </div>

              <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
                <span>6:32</span>
                <ChevronLeft className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
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
              {rooms.map((room) => (
                <div key={room} className="flex">
                  <div className="w-16 p-3 bg-gray-50 flex items-center justify-center border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {room}
                      </span>
                    </div>
                  </div>
                  {timeSlots.map((_, timeIndex) => {
                    const occupancies = getOccupancyForSlot(
                      room,
                      timeSlots[timeIndex]
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
      </div>
    </div>
  );
};

export default BlockedBookings;
