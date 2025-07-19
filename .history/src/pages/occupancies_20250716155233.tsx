import * as React from "react";
 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
 
import { Button } from "../components/ui/button";
 
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "../components/ui/card";
import { ScrollArea } from "../components/scroll-area";

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
  course_semester?:string;
  course_department?:string;
   course_group?:string;
  room_capacity: number;
};
interface FormatDate {
  (date: Date): string;
}

function formatDate(date: Date): string {
  const day: number = date.getDate();
  const month: string = date.toLocaleString('default', { month: 'long' });
  const year: number = date.getFullYear();

  return `${day} ${month} ${year}`;
}
export function OccupanciesPage() {
  const axios = useUserAxios();
  const [data, setData] = React.useState<RoomOccupancy[]>([]);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [selectedOccupancies, setSelectedOccupancies] = React.useState<RoomOccupancy[]>([]);

  const [examsDates, setExamsDates] = React.useState<Set<string>>(new Set());

  const [isGettingOccupancies, startTransition] = React.useTransition();
  const daysOfWeek: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
 
 
  const pageTransitionVariants = {
    enter: (direction: number) => ({
      opacity: 0,
    }),
    center: {
      opacity: 1,
    },
    exit: (direction: number) => ({
      opacity: 0,
      transition: {
        opacity: { duration: 0.2, ease: "easeInOut" },
      },
    }),
  };

  const groupedOccupancies = React.useMemo(() => {
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
      course_semester:occupancy.course_semester,
      course_department:occupancy.course_department,
       course_group:occupancy.course_group,
      exam_id: occupancy.exam_id,
      student_count: occupancy.student_count,
    });

    acc[slotKey].total_students += occupancy.student_count;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((slot: any) => {
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
  }).sort((a, b) => {
    // Sort by room name first, then by start time
    if (a.room_name !== b.room_name) {
      return a.room_name.localeCompare(b.room_name);
    }
    return a.start_time.localeCompare(b.start_time);
  });
}, [selectedOccupancies]);
// Modified handleShowRoomOccupancies function
function handleShowRoomOccupancies(roomOccupancy: RoomOccupancy[]) {
   
  setSelectedOccupancies(roomOccupancy);
  setShowModal(true);
}


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOccupancies([]);
  };

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


  React.useEffect(() => {
    fetchOccupancies();
  }, []);

 

  return isGettingOccupancies ? (
    <TableSkeleton />
  ) : (
    <div>
      <div className="flex flex-col mb-4">
        <motion.h2
          key={"occupancies-header"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl my-5 tracking-tighter font-bold"
        >
          Room Occupancies Plan
        </motion.h2>
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`occupancies-grid`}
          custom={0}
          variants={{
            ...pageTransitionVariants,
            center: {
              ...pageTransitionVariants.center,
              transition: {
                opacity: { duration: 0.2 },
                staggerChildren: 0.02,
              },
            },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {[...examsDates].map((date, index) => {
            const innerDate = new Date(date);
            const dayOfWeek = innerDate.getDay();

            return (
              <motion.div
                className="hover:z-50 border-none h-[150px] rounded group flex flex-col justify-center"
                key={index}
                variants={{
                  enter: { opacity: 0, y: 20 },
                  center: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
                }}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card
                  className="shadow-md cursor-pointer overflow-hidden relative flex p-4 border h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    const roomOccupancy = data.filter(
                      (occupancy) => occupancy.date === date
                    );
                    if (roomOccupancy.length > 0) {
                      handleShowRoomOccupancies(roomOccupancy);
                    } else {
                      alert("No room occupancy data available for this date.");
                    }
                  }}
                >
                  <div className="flex-grow flex flex-col gap-2 w-full text-3xl my-5 tracking-tighter font-bold">
                    {daysOfWeek[dayOfWeek]}
                  </div>
                  <div className="flex-grow flex flex-col gap-2 w-full">
                    {formatDate(date ? new Date(date) : new Date())}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{ formatDate(selectedOccupancies[0]?.date ? new Date(selectedOccupancies[0]?.date) : new Date())}</DialogTitle>
            <DialogDescription>
              Room Occupancy Overview
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] rounded-md border p-4">
  {groupedOccupancies.map((slot, index) => (
    <div key={index} className="space-y-3 py-3 border-b border-gray-600 pt-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {slot.room_name} ({slot.start_time} - {slot.end_time})
          </h3>
          <p className="text-sm text-gray-400">
            {slot.total_students}/{slot.room_capacity} seats occupied ({((slot.total_students / slot.room_capacity) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Horizontal Progress Bar showing course distribution */}
      <div className="w-full bg-gray-700 rounded-lg h-12 overflow-hidden border">
        <div className="flex h-full">
          {slot.courses.map((course: any, courseIndex: number) => {
            const capacityPercentage = (course.student_count / slot.room_capacity) * 100;
            const colors = [
              "bg-gray-500",
              "bg-orange-200", 
              "bg-purple-500",
              "bg-yellow-500",
              "bg-red-500",
              "bg-indigo-500",
              "bg-pink-500",
            ];
            const colorClass = colors[courseIndex % colors.length];

            return (
              <div
                key={courseIndex}
                className={`${colorClass} flex items-center justify-center text-xs font-medium transition-all duration-300 hover:opacity-80 relative group`}
                style={{ width: `${capacityPercentage}%` }}
              >
                <span className="text-white font-semibold">
                  {capacityPercentage > 8 ? course.course_code : ''}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {course.course_code} {course.course_semester} {course.course_group}: {course.student_count} students ({capacityPercentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}

          {/* Empty space */}
          {slot.total_students < slot.room_capacity && (
            <div
              className="bg-gray-600 flex items-center justify-center text-xs text-gray-300 relative group"
              style={{
                width: `${((slot.room_capacity - slot.total_students) / slot.room_capacity) * 100}%`,
              }}
            >
              <span>
                {((slot.room_capacity - slot.total_students) / slot.room_capacity) * 100 > 10 ? 'Empty' : ''}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {slot.room_capacity - slot.total_students} empty seats
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {slot.courses.map((course: any, courseIndex: number) => (
          <div key={courseIndex} className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded ${
                [
                  "bg-gray-500",
                  "bg-blue-500",
                  "bg-purple-500", 
                  "bg-yellow-500",
                  "bg-red-500",
                  "bg-indigo-500",
                  "bg-pink-500",
                ][courseIndex % 7]
              }`}
            ></div>
            <span className="text-xs">
              {course.course_code} {course.course_semester} {course.course_group}: {course.student_count} students
            </span>
          </div>
        ))}
      </div>
    </div>
  ))}
</ScrollArea>

          <DialogFooter className="flex justify-end">
            <Button onClick={handleCloseModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}