import React, {
  useState,
  useEffect,
  useTransition,
  useMemo,
  useRef,
  useContext,
} from "react";
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
  HouseIcon,
  QrCodeIcon,
} from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { format } from "date-fns/format";
import Draggable from "react-draggable";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import useToast from "../hooks/useToast";
import { ScrollArea } from "../components/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  room_instructor?: string;
  room_instructor_id?: string;
  slot_name?: string;
};

type FilterOptions = {
  department: string;
  semester: string;
  capacity: string;
  occupancyStatus: string;
};

interface SelectedRoom {
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface DraggedCourseGroup {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  courseSemester?: string;
  courseDepartment?: string;
  courseGroup?: string;
  roomName?: string;
}
import { useSidebar } from "../components/ui/sidebar";
import QRCode from "react-qr-code";
import LocationContext from "../contexts/LocationContext";
const OccupanciesPage = () => {
  const [data, setData] = useState<RoomOccupancy[]>([]);
  const axios = useUserAxios();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [selectedOccupancies, setSelectedOccupancies] = useState<
    RoomOccupancy[]
  >([]);
  const { setOpen } = useSidebar();
  const [examsDates, setExamsDates] = useState<Set<string>>(new Set());
  const [isGettingOccupancies, startTransition] = useTransition();
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const { selectedLocation } = useContext(LocationContext);
  const [draggedCourseGroup, setDraggedCourseGroup] =
    useState<DraggedCourseGroup | null>(null);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { setServerLoadingMessage, setToastMessage, serverLoadingMessage } =
    useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dropAction, setDropAction] = useState<"group" | "students" | null>(
    null
  );
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
  const [isGettingStudents, startGettingStudentsTransition] = useTransition();
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<any | null>(
    null
  );
  const [isAssigningInstructor, startAssigningInstructorTransition] =
    useTransition();
  const [instructors, setInstructors] = useState<any[] | null>(null);

  const [dimensions, setDimensions] = useState({
    width: 800, // Initial width
    height: 600, // Initial height
  });

  // Extract unique values from data for filters
  const filterOptions = useMemo(() => {
    const departments = [
      ...new Set(data.map((d) => d.course_department).filter(Boolean)),
    ];
    const semesters = [
      ...new Set(data.map((d) => d.course_semester).filter(Boolean)),
    ];
    const capacities = [
      ...new Set(data.map((d) => d.room_capacity).filter(Boolean)),
    ].sort((a, b) => a - b);

    return { departments, semesters, capacities };
  }, [data]);

  // Get available dates from API data
  const availableDates = useMemo(() => {
    const dates = Array.from(examsDates).sort();
    return dates;
  }, [examsDates]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((occupancy) => {
      const matchesSearch =
        searchTerm === "" ||
        occupancy.course_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        occupancy.course_title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        occupancy.room_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        filters.department === "" ||
        occupancy.course_department === filters.department;

      const matchesSemester =
        filters.semester === "" ||
        occupancy.course_semester === filters.semester;

      const matchesCapacity =
        filters.capacity === "" ||
        occupancy.room_capacity.toString() === filters.capacity;

      const totalStudents = data
        .filter(
          (d) =>
            d.room_name === occupancy.room_name &&
            d.start_time === occupancy.start_time
        )
        .reduce((sum, d) => sum + d.student_count, 0);

      const isOvercapacity = totalStudents > occupancy.room_capacity;
      const matchesOccupancyStatus =
        filters.occupancyStatus === "" ||
        (filters.occupancyStatus === "overcapacity" && isOvercapacity) ||
        (filters.occupancyStatus === "normal" && !isOvercapacity);
      const matchesDate =
        selectedDate === "" || occupancy.date === selectedDate;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesSemester &&
        matchesCapacity &&
        matchesOccupancyStatus &&
        matchesDate
      );
    });
  }, [data, searchTerm, filters, selectedDate]);

  const modalRef = useRef<HTMLDivElement>(null);
  const studentModalRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleGettingStudents = (course: DraggedCourseGroup) => {
    if (!course) return;

    setShowStudentModal(true);
    startGettingStudentsTransition(async () => {
      setServerLoadingMessage({
        message: `Fetching students for ${course.courseCode}`,
        isServerLoading: true,
      });

      try {
        const response = await axios.post(`/api/rooms/students/`, {
          courseGroup: course,
        });
        if (response.status === 200) {
          const students = response.data.students;
          setCourseStudents(students);
        }
      } catch (error) {
        setToastMessage({
          message: "Failed to fetch students. Please try again.",
          variant: "danger",
        });
      } finally {
        setServerLoadingMessage({
          isServerLoading: false,
        });
        setDraggedCourseGroup(null);
        setSelectedRoom(null);
      }
    });
  };

  const getInstructors = async () => {
    try {
      const resp = await axios.get("/users/instructors");
      if (resp.data.success) {
        setInstructors(resp.data.data);
      }
    } catch (error) {}
  };
  const handleDroppedGroup = async (
    e: React.DragEvent,
    selectedRoom: SelectedRoom
  ) => {
    e.preventDefault();
    setSelectedRoom(selectedRoom);
    setServerLoadingMessage({
      message: `Changing exam room`,
      isServerLoading: true,
    });

    try {
      if (dropAction === "group") {
        if (!draggedCourseGroup) return;

        try {
          const verifyResponse = await axios.post(
            "/api/rooms/verify_room_change/",
            {
              room: selectedRoom,
              courseGroup: draggedCourseGroup,
            }
          );

          if (verifyResponse.status === 200) {
            const changeResponse = await axios.patch(
              "/api/rooms/change_room/",
              {
                room: selectedRoom,
                courseGroup: draggedCourseGroup,
              }
            );

            if (changeResponse.status === 201) {
              await fetchOccupancies();
              setToastMessage({
                message: "Exam room changed successfully",
                variant: "success",
              });
            } else {
              setDialogMessage(
                changeResponse.data?.message || "Room change failed"
              );
              setDialogOpen(true);
            }
          } else {
            setDialogMessage(
              verifyResponse.data?.message || "Verification failed"
            );
            setDialogOpen(true);
          }
        } catch (error: any) {
          setDialogMessage(
            error.response?.data?.message || "Verification error occurred"
          );
          setDialogOpen(true);
        }
      }

      if (dropAction === "students") {
        if (selectedStudents.length <= 0) return;

        try {
          // First verify the student change
          const verifyResponse = await axios.post(
            "/api/rooms/verify_change_students/",
            {
              room: selectedRoom,
              students: selectedStudents,
            }
          );

          if (verifyResponse.status === 200) {
            // If verification succeeds, proceed with the actual change
            const changeResponse = await axios.patch(
              "/api/rooms/change_students/",
              {
                room: selectedRoom,
                students: selectedStudents,
              }
            );

            if (changeResponse.status === 201) {
              await fetchOccupancies();
              setToastMessage({
                message: "Exam room changed successfully",
                variant: "success",
              });
            } else {
              setDialogMessage(
                changeResponse.data?.message ||
                  "Student change failed after verification"
              );
              setDialogOpen(true);
            }
          } else {
            setDialogMessage(
              verifyResponse.data?.message ||
                "Student change verification failed"
            );
            setDialogOpen(true);
          }
        } catch (error: any) {
          setDialogMessage(
            error.response?.data?.message || "Error during student room change"
          );
          setDialogOpen(true);
        }
      }
    } catch (error) {
      setToastMessage({
        message: "Failed to change exam room. Please try again.",
        variant: "danger",
      });
    } finally {
      setDraggedCourseGroup(null);
      setSelectedRoom(null);
      setShowModal(false);
      setShowStudentModal(false);
      setSelectedStudents([]);
      setDropAction(null);
      setServerLoadingMessage({
        isServerLoading: false,
      });
    }
  };

  const handleCourseGroupDragStart = (
    e: React.DragEvent,
    group: DraggedCourseGroup
  ) => {
    setDraggedCourseGroup({ ...group });
    setDropAction("group");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleStudentDragStart = (e: React.DragEvent, student: any) => {
    const selected = selectedStudents?.some((s) => s.id == student.id);
    !selected && setSelectedStudents((prev: any) => [...prev, student]);
    setDropAction("students");
    e.dataTransfer.effectAllowed = "move";
  };

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

        return { ...slot, duration: durationText };
      })
      .sort((a, b) => {
        if (a.room_name !== b.room_name) {
          return a.room_name.localeCompare(b.room_name);
        }
        return a.start_time.localeCompare(b.start_time);
      });
  }, [selectedOccupancies, data]);

  const fetchOccupancies = async () => {
    startTransition(async () => {
      try {
        let resp = null;
        if (selectedLocation)
          resp = await axios.get(
            `/api/rooms/occupancies?location=${selectedLocation.id}`
          );
        else {
          resp = await axios.get("/api/rooms/occupancies/");
        }
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
                room_instructor: room.instructor.first_name,
                room_instructor_id: room.instructor.first_name,
                slot_name: room.slot_name,
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
                course_group: exam.course_group,
              });
            }
          }
        }

        setData(flatData);
        setRooms(Array.from(roomSet).sort());
        setTimeSlots(Array.from(timeSet).sort());
        setExamsDates(new Set(dates));
      } catch (error) {
        setToastMessage({
          message: "Failed to load room occupancies. Please try again.",
          variant: "danger",
        });
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
    handleCloseStudentsModal();
  };

  const handleCloseStudentsModal = () => {
    setShowStudentModal(false);
    setCourseStudents([]);
    setSelectedStudents([]);
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
    const displayHour =
      hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
      setSelectedDate(availableDates[currentDateIndex - 1]);
    } else if (
      direction === "next" &&
      currentDateIndex < availableDates.length - 1
    ) {
      setCurrentDateIndex(currentDateIndex + 1);
      setSelectedDate(availableDates[currentDateIndex + 1]);
    }
  };

  const exportData = () => {
    const csvContent = [
      [
        "Room",
        "Date",
        "Time",
        "Course Code",
        "Course Title",
        "Students",
        "Capacity",
        "Department",
        "Semester",
      ],
      ...filteredData.map((d) => [
        d.room_name,
        d.date,
        `${d.start_time}-${d.end_time}`,
        d.course_code,
        d.course_title,
        d.student_count,
        d.room_capacity,
        d.course_department,
        d.course_semester,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `room-occupancies-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOccupancyStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = new Set(filteredData.map((d) => d.room_name)).size;
    const totalStudents = filteredData.reduce(
      (sum, d) => sum + d.student_count,
      0
    );
    const overcapacityRooms = filteredData.filter((d) => {
      const roomOccupancy = filteredData
        .filter(
          (fd) => fd.room_name === d.room_name && fd.start_time === d.start_time
        )
        .reduce((sum, fd) => sum + fd.student_count, 0);
      return roomOccupancy > d.room_capacity;
    }).length;

    return { totalRooms, occupiedRooms, totalStudents, overcapacityRooms };
  };

  const stats = getOccupancyStats();

  const OccupancyCard = ({ occupancies }: { occupancies: RoomOccupancy[] }) => {
    const totalStudents = occupancies.reduce(
      (sum, occ) => sum + occ.student_count,
      0
    );
    const capacity = occupancies[0]?.room_capacity || 0;
    const isOvercapacity = totalStudents > capacity;
    const utilizationRate =
      capacity > 0 ? ((totalStudents / capacity) * 100).toFixed(0) : 0;

    return (
      <div className="flex flex-col justify-center p-2">
        <div className="flex flex-wrap justify-between">
          {<Badge variant={"default"}>{occupancies[0].room_instructor}</Badge>}

          <select
            value={occupancies[0].room_instructor_id}
            onChange={(e) => {
              startAssigningInstructorTransition(async () => {
                try {
                  const room= occupancies[0]
                  const resp= await axios.post("/rooms/assign_instructor",{
                  instructor_id: e.target.value,
                  date:room.date,
                  slot_name:room.slot_name
                  })
                } catch (error) {
                  setToastMessage({
                    message:
                      "Failed to assign instructor to this room please try again",
                    variant: "danger",
                  });
                }
              });
            }}
          >
            {instructors?.map((instructor, idx) => {
              return (
                <option value={instructor.id} key={idx}>
                  {instructor.first_name} {instructor.last_name}
                </option>
              );
            })}
          </select>
        </div>
        <div
          className={`relative h-16 rounded-md p-2 text-xs cursor-move hover:shadow-md   text-black hover:scale-105 ${
            isOvercapacity
              ? "bg-red-800 border border-red-200 hover:bg-red-100"
              : totalStudents > capacity * 0.8
              ? "bg-primary border border-primary hover:bg-primary text-white"
              : "bg-blue-300 border border-blue-300 hover:bg-blue-200"
          }`}
          onClick={() => handleShowRoomOccupancies(occupancies)}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium truncate ${
                    isOvercapacity ? "text-red-700" : "text-black-700"
                  }`}
                >
                  {occupancies.length === 1
                    ? occupancies[0].course_code
                    : `${occupancies.length} Courses`}
                </div>
                <div
                  className={`text-xs truncate flex items-center gap-1 ${
                    isOvercapacity
                      ? "text-red-600"
                      : "text-yellow-400 font-bold"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {totalStudents}/{capacity} ({utilizationRate}%)
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 font-bold flex-shrink-0 cursor-pointer" />
            </div>
            <div className="text-xs   flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(occupancies[0].start_time)}
            </div>
          </div>
          {isOvercapacity && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-2 h-2" />
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchOccupancies();
    setOpen(false);
  }, []);
  useEffect(() => {
    fetchOccupancies();
  }, [selectedLocation]);
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
      setCurrentDateIndex(0);
    }
  }, [availableDates]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        setDialogOpen(!dialogOpen);
        setSelectedRoomDetails(null);
        setShowQrCode(false);
        setDialogMessage(null);
      }}
    >
      <div
        className={` ${
          serverLoadingMessage?.isServerLoading &&
          "pointer-events-none opacity-20"
        }`}
      >
        <div className="min-h-screen bg-background">
          {/* Stats Bar */}
          <div className=" border-b px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Total Rooms:</span>
                  <span className="font-semibol">{stats.totalRooms}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Occupied:</span>
                  <span className="font-semibold">{stats.occupiedRooms}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Students:</span>
                  <span className="font-semibold">{stats.totalStudents}</span>
                </div>
                {stats.overcapacityRooms > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Overcapacity:</span>
                    <span className="font-semibold">
                      {stats.overcapacityRooms}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Grouped Buttons */}
                <div className="flex rounded-full border overflow-hidden">
                  <Button onClick={exportData} variant="default">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>

                  <Button
                    onClick={fetchOccupancies}
                    className="flex items-center space-x-2 px-3 py-1 rounded-none last:rounded-r-full text-sm"
                    variant="outline"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isGettingOccupancies ? "animate-spin" : ""
                      }`}
                    />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className=" border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search courses, rooms..."
                    className="pl-10 pr-4 py-2 border  rounded-md text-sm w-64 font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm `}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-4 gap-4 p-4 rounded-md">
                {/* Departments (already styled) */}
                <Select
                  value={filters.department}
                  onValueChange={(value) =>
                    setFilters({ ...filters, department: value })
                  }
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.departments.map((dept) => (
                      <SelectItem key={dept} value={dept ? dept : ""}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Semesters */}
                <Select
                  value={filters.semester}
                  onValueChange={(value) =>
                    setFilters({ ...filters, semester: value })
                  }
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.semesters.map((sem) => (
                      <SelectItem key={sem} value={sem ? sem : ""}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Capacities */}
                <Select
                  value={filters.capacity}
                  onValueChange={(value) =>
                    setFilters({ ...filters, capacity: value })
                  }
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Capacities" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.capacities.map((cap) => (
                      <SelectItem key={cap} value={cap.toString()}>
                        {cap} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Occupancy Status */}
                <Select
                  value={filters.occupancyStatus}
                  onValueChange={(value) =>
                    setFilters({ ...filters, occupancyStatus: value })
                  }
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="overcapacity">Overcapacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border-b  px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigateDate("prev")}
                  disabled={currentDateIndex === 0}
                  className="p-1  rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  variant={"default"}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">Date</span>
                  <span className="font-medium">
                    {format(new Date(selectedDate), "PPPP")}
                  </span>
                </div>
                <Button
                  onClick={() => navigateDate("next")}
                  disabled={currentDateIndex === availableDates.length - 1}
                  className="p-1  rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-lg border  overflow-hidden">
              <div className="flex border-b ">
                <div className="w-20 p-3  font-medium text-sm mx-7 ">Rooms</div>
                {timeSlots.map((time, index) => (
                  <div
                    key={index}
                    className="flex-1 p-3  text-center text-sm font-medium  border-r  last:border-r-0 flex col"
                  >
                    {formatTime(time)}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                {rooms.map((room) => (
                  <div key={room} className="flex">
                    <div className="w-fit p-3  items-center justify-center border-r">
                      <Button
                        className="flex items-center space-x-2 flex-1 min-w-fit"
                        onClick={() => {
                          setShowQrCode(true);
                          setSelectedRoomDetails({
                            name: room,
                            date: selectedDate,
                          });
                          setDialogOpen(true);
                        }}
                        variant={"secondary"}
                      >
                        <HouseIcon className="w-4 h-3" />
                        <span className="text-sm font-medium ">{room}</span>
                        <QrCodeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    {timeSlots.map((_, timeIndex) => {
                      const occupancies = getOccupancyForSlot(
                        room,
                        timeSlots[timeIndex]
                      );
                      return (
                        <div
                          key={timeIndex}
                          className="flex-1 p-2 border-r  last:border-r-0 min-h-[80px] cursor-move"
                          onDrop={(e) => {
                            handleDroppedGroup(e, {
                              roomName: room,
                              date: selectedDate,
                              startTime: timeSlots[timeIndex],
                              endTime: timeSlots[timeIndex],
                            });
                          }}
                          onDragOver={handleDragOver}
                        >
                          {occupancies.length > 0 && (
                            <div
                              draggable
                              onDragStart={(e) => {
                                handleCourseGroupDragStart(e, {
                                  courseId:
                                    occupancies[occupancies.length - 1].exam_id,
                                  courseCode:
                                    occupancies[occupancies.length - 1]
                                      .course_code,
                                  courseTitle:
                                    occupancies[occupancies.length - 1]
                                      .course_title,
                                  courseSemester:
                                    occupancies[occupancies.length - 1]
                                      .course_semester,
                                  courseDepartment:
                                    occupancies[occupancies.length - 1]
                                      .course_department,
                                  courseGroup:
                                    occupancies[occupancies.length - 1]
                                      .course_group,
                                  roomName:
                                    occupancies[occupancies.length - 1]
                                      .room_name,
                                });
                              }}
                            >
                              <OccupancyCard occupancies={occupancies} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showModal && (
            <div>
              <Draggable
                handle=".drag-handle"
                cancel=".no-drag"
                nodeRef={modalRef}
              >
                <div
                  ref={modalRef}
                  className={`bg-background border p-2 animate-in border-gray-800 shadow-gray-800 z-50 relative  w-fit hover:z-[55] rounded-lg shadow-lg duration-200 text-white`}
                  style={{
                    position: "fixed",
                    maxHeight: "80vh",
                    top: "25%",
                    left: "40%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <PanelGroup direction="horizontal">
                    {/* Second Panel (could be empty or contain additional info) */}
                    <Panel
                      className="w-0 min-w-0 overflow-hidden"
                      defaultSize={0}
                      minSize={0}
                      maxSize={0} // Lock at 0 width
                      order={1} // Explicit order helps
                    />
                    <PanelResizeHandle className="w-1   hover:bg-gray-800 transition-colors" />

                    <Panel
                      defaultSize={60}
                      minSize={30}
                      order={2}
                      className="drag-handle  border-b  cursor-move"
                    >
                      <div className="text-center space-y-4 p-4 flex items-center justify-between  bg-gray-800 w-full">
                        <h1 className="text-l font-bold leading-tight">
                          Room Occupancy Details
                        </h1>
                        <Button
                          className="ring-offset-background focus:ring-ring  absolute top-1 right-8 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                          variant={"secondary"}
                          onClick={handleCloseModal}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-6  w-fit no-drag cursor-default   overflow-y-scroll max-h-[50vh]">
                        {groupedOccupancies.map((slot, index) => (
                          <div
                            key={index}
                            className="mb-6 p-4 border  rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-5 h-5 text-blue-500" />
                                  <span className="font-semibold text-lg">
                                    Room {slot.room_name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 font-semibold" />
                                  <span className="text-sm font-bold">
                                    {formatTime(slot.start_time)} -{" "}
                                    {formatTime(slot.end_time)} ({slot.duration}
                                    )
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span
                                  className={`font-semibold ${
                                    slot.total_students > slot.room_capacity
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {slot.total_students} / {slot.room_capacity}{" "}
                                  students
                                </span>
                                {slot.total_students > slot.room_capacity && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>

                            <div className="grid gap-3 ">
                              {slot.courses.map(
                                (course: any, courseIndex: number) => (
                                  <div
                                    key={courseIndex}
                                    className="p-3  rounded-sm border  cursor-grabbing"
                                    draggable
                                    onDragStart={(e) => {
                                      handleCourseGroupDragStart(e, {
                                        courseId: course.exam_id,
                                        courseCode: course.course_code,
                                        courseTitle: course.course_title,
                                        courseSemester: course.course_semester,
                                        courseDepartment:
                                          course.course_department,
                                        courseGroup: course.course_group,
                                        roomName: slot.room_name,
                                      });
                                    }}
                                  >
                                    <div
                                      className="flex items-center justify-between hover:opacity-50"
                                      onClick={() => {
                                        handleGettingStudents({
                                          courseId: course.exam_id,
                                          courseCode: course.course_code,
                                          courseTitle: course.course_title,
                                          courseSemester:
                                            course.course_semester,
                                          courseDepartment:
                                            course.course_department,
                                          courseGroup: course.course_group,
                                          roomName: slot.room_name,
                                        });
                                      }}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                          <span className="font-medium text-blue-700">
                                            {course.course_code}
                                          </span>
                                          <span className="text-gray-600">
                                            {course.course_title}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-sm">
                                          {course.course_department && (
                                            <span>
                                              Department:{" "}
                                              {course.course_department}
                                            </span>
                                          )}
                                          {course.course_semester && (
                                            <span>
                                              Semester: {course.course_semester}
                                            </span>
                                          )}
                                          {course.course_group && (
                                            <span>
                                              Group: {course.course_group}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4" />
                                        <Badge
                                          className="font-medium"
                                          variant="outline"
                                        >
                                          {course.student_count} students
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            {slot.total_students > slot.room_capacity && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                  <span className="font-medium text-red-700">
                                    Overcapacity Warning
                                  </span>
                                </div>
                                <p className="text-sm text-red-600 mt-1">
                                  This room is overcapacity by{" "}
                                  {slot.total_students - slot.room_capacity}{" "}
                                  students. Consider moving some exams to larger
                                  rooms or different time slots.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Panel>
                    <PanelResizeHandle className="w-1   hover:bg-gray-800 transition-colors" />

                    {/* Second Panel (could be empty or contain additional info) */}
                    <Panel
                      className="w-0 min-w-0 overflow-hidden"
                      defaultSize={0}
                      minSize={0}
                      maxSize={0} // Lock at 0 width
                      order={3}
                    />
                  </PanelGroup>
                </div>
              </Draggable>
            </div>
          )}

          {showStudentModal && (
            <div>
              <Draggable
                handle=".drag-handle"
                cancel=".no-drag"
                nodeRef={studentModalRef}
              >
                <div
                  ref={studentModalRef}
                  className={`bg-background border animate-in border-gray-800 shadow-gray-800 p-2 z-50 relative  text-white w-fit hover:z-[55] rounded-lg shadow-lg duration-200`}
                  style={{
                    position: "fixed",
                    maxHeight: "80vh",
                    top: "10%",
                    left: "10%",
                    transform: "translate(-50%, -50%)",
                  }}
                  onWheel={(e) => e.stopPropagation()}
                >
                  <PanelGroup
                    direction="horizontal"
                    onLayout={(sizes: number[]) => {
                      // Calculate new width based on panel sizes (adjust formula as needed)
                      const newWidth =
                        sizes.reduce((sum, size) => sum + size, 0) + 32;
                      setDimensions((prev) => ({
                        ...prev,
                        width: newWidth,
                      }));
                    }}
                  >
                    <Panel
                      className="w-0 min-w-0 overflow-hidden"
                      defaultSize={0}
                      minSize={0}
                      maxSize={0} // Lock at 0 width
                      order={1} // Explicit order helps
                    />
                    <PanelResizeHandle className="w-1   hover:bg-gray-800 transition-colors" />

                    <Panel
                      defaultSize={60}
                      minSize={30}
                      order={2}
                      className="drag-handle  border-b  cursor-move"
                    >
                      <div className="text-center space-y-4 p-4 flex items-center justify-between bg-gray-800 w-full">
                        <h1 className="text-l  font-bold">
                          Students Belongs in Selected Course Group
                        </h1>
                        <Button
                          className="ring-offset-background focus:ring-ring  absolute top-1 right-8 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                          variant={"secondary"}
                          onClick={handleCloseStudentsModal}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {isGettingStudents ? (
                        <div className="flex items-center justify-center p-2 font-bold">
                          {" "}
                          <RefreshCw
                            className={`w-4 h-4 ${
                              isGettingStudents ? "animate-spin" : ""
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="p-6  no-drag cursor-default font-bold">
                          <div className="flex items-center">
                            {" "}
                            <Checkbox
                              className="h-4 w-4 m-2 border shadow-md border-foreground"
                              id="select-all"
                              checked={
                                courseStudents.length ===
                                selectedStudents?.length
                              }
                              onCheckedChange={(checked) => {
                                return checked
                                  ? setSelectedStudents([...courseStudents])
                                  : setSelectedStudents([]);
                              }}
                            />{" "}
                            <Label
                              htmlFor="select-all"
                              className="text-foreground"
                            >
                              Select All
                            </Label>
                          </div>
                          <div className=" overflow-y-scroll max-h-[50vh]">
                            {courseStudents.map((student, index) => (
                              <div
                                key={index}
                                className="p-3  rounded-sm border  cursor-grabbing mt-2"
                                draggable
                                onDragStart={(e) =>
                                  handleStudentDragStart(e, student)
                                }
                              >
                                <div
                                  className="flex items-center justify-between hover:opacity-50 border-foreground"
                                  onClick={() => {
                                    const selected = selectedStudents?.some(
                                      (s) => s.id == student.id
                                    );
                                    selected
                                      ? setSelectedStudents([
                                          ...selectedStudents?.filter(
                                            (s: any) => s.id != student.id
                                          ),
                                        ])
                                      : setSelectedStudents((prev: any) => [
                                          ...prev,
                                          student,
                                        ]);
                                  }}
                                >
                                  <Checkbox
                                    className="h-4 w-4 m-2 border shadow-md border-foreground"
                                    id={student.id}
                                    checked={selectedStudents?.some(
                                      (s) => s.id == student.id
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? setSelectedStudents((prev: any) => [
                                            ...prev,
                                            student,
                                          ])
                                        : setSelectedStudents([
                                            ...selectedStudents?.filter(
                                              (s: any) => s.id != student.id
                                            ),
                                          ]);
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-medium text-blue-700">
                                        {student.student.reg_no}
                                      </span>
                                      <span className="text-gray-600">
                                        {student.student.user.first_name}{" "}
                                        {student.student.user.last_name}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 text-sm  ">
                                      {student.student.department && (
                                        <span>
                                          Department:{" "}
                                          {student.student.department.name}
                                        </span>
                                      )}
                                      {student.exam.group.course.semester && (
                                        <span>
                                          Semester:{" "}
                                          {
                                            student.exam.group.course.semester
                                              .name
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Panel>
                    <PanelResizeHandle className="w-2   hover:bg-gray-800 transition-colors" />

                    {/* Second Panel (could be empty or contain additional info) */}
                    <Panel
                      className="w-0 min-w-0 overflow-hidden"
                      defaultSize={0}
                      minSize={0}
                      maxSize={0} // Lock at 0 width
                      order={3}
                    />
                  </PanelGroup>
                </div>
              </Draggable>
            </div>
          )}
        </div>
      </div>

      {dialogMessage && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              Room Error
            </DialogTitle>

            <DialogDescription className="text-sm  max-w-md mx-auto leading-relaxed  text-center">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>

          {/* <ShowMoreExamsModal data={moreExams} /> */}
        </DialogContent>
      )}

      {showQrCode && selectedRoomDetails && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              Room {selectedRoomDetails.name}
            </DialogTitle>

            <DialogDescription className="text-sm  max-w-md mx-auto leading-relaxed  text-center">
              <div className="relative">
                <QRCode
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={JSON.stringify(selectedRoomDetails)}
                  viewBox={`0 0 256 256`}
                  level="M"
                  className="rounded-lg"
                />
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* <ShowMoreExamsModal data={moreExams} /> */}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default OccupanciesPage;
