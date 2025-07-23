import { useState, useEffect, useTransition } from "react";
import {
  Search,
  Clock,
  Calendar,
  X,
  Grip,
  Trash,
  CalendarIcon,
} from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Input } from "../components/ui/input";
import { Exam, MyExam } from "./exams";
import { Badge } from "../components/ui/badge";
import ShowMoreExamsModal from "../components/schedule/_modals/show-more-exams-model";
import {
  CourseGroup,
  UnscheduledCourse,
  UnscheduledCourseEnhanced,
} from "../contexts/ExamSchedulesContexts";
import useExamsSchedule from "../hooks/useExamShedule";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { group } from "console";
import { ScrollArea } from "../components/scroll-area";
import { Button } from "../components/ui/button";
import useToast from "../hooks/useToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

interface Slot {
  id: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface AssignedCourse extends UnscheduledCourseEnhanced {
  slotId: string;
}

class DailySlot {
  date: Date;
  name: string;
  startTime: string;
  endTime: string;

  public constructor({
    date,
    name,
    startTime,
    endTime,
  }: {
    date: Date;
    name: string;
    startTime: string;
    endTime: string;
  }) {
    this.date = date;
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

interface ScheduledExam {
  exam: Exam;
  groups: CourseGroup[];
}

interface SlotExam {
  name: "Morning" | "Afternoon" | "Evening";
  exams: any[];
}
interface DailyExam {
  day: string;
  exams: SlotExam[];
}

interface UnScheduledExamWithDailySlot {
  exams: UnscheduledCourse[];
}

interface DialogOption {
  option: "more" | "conflict" | "group-conflict";
}
function ManualTimeTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [draggedCourseGroup, setDraggedCourseGroup] = useState(null);
  const axios = useUserAxios();
  const { setServerLoadingMessage, setToastMessage, serverLoadingMessage } =
    useToast();
  const [timeSlots, setTimeSlots] = useState<Slot[]>([]);
  const { setUnScheduled } = useExamsSchedule();
  const [unscheduledExams, setUnScheduledExams] = useState<
    UnscheduledCourseEnhanced[]
  >([]);

  const [moreExams, setMoreExams] = useState<MyExam[]>([]);
  const [existingDraggedExamGroup, setExistingDraggedExamGroup] = useState<
    MyExam|null
  >(null);
  const [scheduledExams, setScheduledExams] = useState<DailyExam[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogOption, setDialogOption] = useState<DialogOption | null>(null);
  const [conflictMessage, setConflictMessage] = useState<any[] | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any | null>(null);

  const getUnscheduledExams = async () => {
    const resp = await axios.get("api/exams/exams/unscheduled_exams");
    if (resp.data.success) {
      setUnScheduledExams(resp.data.data);
    }
  };

  const getExams = async () => {
    try {
      const resp = await axios.get("/api/exams/exams");

      let exams: DailyExam[] = [];
      resp.data.data.map((ex: any) => {
        let ex_date = ex.date;
        let existingDay = exams.find(
          (e) => e.day.toLowerCase() == ex_date.toLowerCase()
        );
        if (existingDay !== undefined) {
          existingDay.exams.map((slot) => {
            if (
              slot.name == "Morning" &&
              ex.start_time == "08:00:00" &&
              ex.end_time == "11:00:00"
            ) {
              slot.exams.push(ex);
            } else if (
              slot.name == "Afternoon" &&
              ex.start_time == "13:00:00" &&
              ex.end_time == "16:00:00"
            ) {
              slot.exams.push(ex);
            } else if (
              slot.name == "Evening" &&
              ex.start_time == "18:00:00" &&
              ex.end_time == "20:00:00"
            ) {
              slot.exams.push(ex);
            }
            return slot;
          });
          exams.map((e) => {
            if (e.day.toLowerCase() == ex_date.toLowerCase()) {
              return existingDay;
            }
            return e;
          });
        } else {
          let newDay: DailyExam = {
            day: ex_date,
            exams: [
              { name: "Morning", exams: [] },
              { name: "Afternoon", exams: [] },
              { name: "Evening", exams: [] },
            ],
          };
          if (ex.start_time == "08:00:00" && ex.end_time == "11:00:00") {
            newDay.exams[0].exams.push(ex);
          } else if (ex.start_time == "13:00:00" && ex.end_time == "16:00:00") {
            newDay.exams[1].exams.push(ex);
          } else if (ex.start_time == "18:00:00" && ex.end_time == "20:00:00") {
            newDay.exams[2].exams.push(ex);
          }

          exams.push(newDay);
        }
      });

      setScheduledExams(exams);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredCourses = unscheduledExams.filter(
    (exam) =>
      exam.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.department.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      exam.course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allUnscheduled = filteredCourses.filter(
    (exam) =>
      !assignedCourses.some((assigned) => assigned.course.id === exam.course.id)
  );

  const handleDragStart = (e: React.DragEvent, course: any) => {
    setDraggedCourse(course);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCourseGroupDragStart = (e: React.DragEvent, group: any) => {
    setDraggedCourseGroup({ ...group });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleExistingCourseGroupDragStart = (
    e: React.DragEvent,
    group: any
  ) => {
    setExistingDraggedExamGroup({ ...group });
    console.log(group)
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDroppedCourse = async (e: React.DragEvent, slotInfo: any) => {
    e.preventDefault();
    setSelectedSlotInfo(slotInfo);
     
    if (draggedCourseGroup) {
      try {
        setDialogOpen(false);
        setServerLoadingMessage({
          message: `Scheduling single exam group`,
          isServerLoading: true,
        });
        const resp = await axios.post("/api/exams/exams/add-exam-to-slot/", {
          ...slotInfo,
          course_group: draggedCourseGroup,
        });

        if (resp.data.success) {
          if (resp.data.success) {
            if (resp.data.conflict) {
              setConflictMessage(resp.data.data);
              setDialogOption({ option: "conflict" });
              setDialogOpen(true);
            }
          } else {
            setToastMessage({ message: resp.data.message, variant: "danger" });
          }
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        console.log(error);
        setToastMessage({ message: String(error), variant: "danger" });
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
    } else if (draggedCourse) {
      try {
        setServerLoadingMessage({
          message: `Processing`,
          isServerLoading: true,
        });
        const resp = await axios.post("/api/exams/exams/add-exam-to-slot/", {
          ...slotInfo,
          course_group: draggedCourse,
        });

        if (resp.data.success) {
          if (resp.data.conflict) {
            setConflictMessage(resp.data.data);
            setDialogOption({ option: "conflict" });
            setDialogOpen(true);
          }
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
    }else if (existingDraggedExamGroup) {
      try {
        setServerLoadingMessage({
          message: `Processing`,
          isServerLoading: true,
        });
        const resp = await axios.post("/api/exams/exams/schedule-course-single-group/", {
          ...slotInfo,
          course_group: existingDraggedExamGroup,
        });

        if (resp.data.success) {
          if (resp.data.conflict) {
            setConflictMessage(resp.data.data);
            setDialogOption({ option: "conflict" });
            setDialogOpen(true);
          }
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
    }
  };

  const scheduleCourse = async () => {
    if (draggedCourse) {
      try {
        setDialogOpen(false);
        setServerLoadingMessage({
          message: `Scheduling Exam`,
          isServerLoading: true,
        });
        const resp = await axios.post(
          "/api/exams/exams/schedule-course-group/",
          {
            ...selectedSlotInfo,
            course_group: draggedCourse,
          }
        );

        if (resp.data.success) {
          setToastMessage({ message: resp.data.message, variant: "success" });
          handleDrop(selectedSlotInfo);
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
        setDraggedCourse(null);
        setSelectedSlotInfo(null);
        setDraggedCourseGroup(null);
        setExistingDraggedExamGroup(null)
      }
    } else if (draggedCourseGroup) {
      try {
        setDialogOpen(false);
        setServerLoadingMessage({
          message: `Scheduling Exam`,
          isServerLoading: true,
        });
        const resp = await axios.post(
          "/api/exams/exams/schedule-course-single-group/",
          {
            ...selectedSlotInfo,
            course_group: draggedCourseGroup,
          }
        );

        if (resp.data.success) {
          setToastMessage({ message: resp.data.message, variant: "success" });
          handleDrop(selectedSlotInfo);
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
        setDraggedCourse(null);
        setSelectedSlotInfo(null);
        setDraggedCourseGroup(null);
        setExistingDraggedExamGroup(null)
      }
    } 
  };

  const removeExamCourse = async (courseExamInfo: any) => {
    try {
      setDialogOpen(false);
      setServerLoadingMessage({
        message: `Removing Exam`,
        isServerLoading: true,
      });
      const resp = await axios.patch(
        "/api/exams/exams/remove-scheduled-exam/",
        {
          ...courseExamInfo,
        }
      );

      if (resp.data.success) {
        setToastMessage({ message: resp.data.message, variant: "success" });
        removeCourseFromSlot(courseExamInfo);
        setUnScheduledExams(resp.data.unscheduled);
        await getExams();
      } else {
        setToastMessage({ message: resp.data.message, variant: "danger" });
      }
    } catch (error) {
      setToastMessage({ message: String(error), variant: "danger" });
    } finally {
      setServerLoadingMessage({ isServerLoading: false });
    }
  };
  const handleDrop = (slotInfo: any) => {
    if (draggedCourse) {
      const exams = [...scheduledExams];
      let course = draggedCourse;
      let existingDay = exams.find(
        (e) => e.day.toLowerCase() == slotInfo.day.toLowerCase()
      );
      course.groups.map((ex: any) => {
        if (existingDay !== undefined) {
          existingDay.exams.map((slot) => {
            if (slot.name == "Morning" && slotInfo.slot.name == "Morning") {
              slot.exams.push(ex);
            } else if (
              slot.name == "Afternoon" &&
              slotInfo.slot.name == "Afternoon"
            ) {
              slot.exams.push(ex);
            } else if (
              slot.name == "Evening" &&
              slotInfo.slot.name == "Evening"
            ) {
              slot.exams.push(ex);
            }
            return slot;
          });
          exams.map((e) => {
            if (e.day.toLowerCase() == slotInfo.day.toLowerCase()) {
              return existingDay;
            }
            return e;
          });
        }
      });

      setScheduledExams(exams);
      let updatedUnscheduled = unscheduledExams.filter(
        (ex) => ex.id !== draggedCourse.id
      );
      setUnScheduledExams(updatedUnscheduled);
    }

    if (draggedCourseGroup) {
      const exams = [...scheduledExams];
      let courseGroup: any = draggedCourseGroup;
      let existingDay = exams.find(
        (e) => e.day.toLowerCase() == slotInfo.day.toLowerCase()
      );

      if (existingDay !== undefined) {
        existingDay.exams.map((slot) => {
          if (slot.name == "Morning" && slotInfo.slot.name == "Morning") {
            slot.exams.push(courseGroup);
          } else if (
            slot.name == "Afternoon" &&
            slotInfo.slot.name == "Afternoon"
          ) {
            slot.exams.push(courseGroup);
          } else if (
            slot.name == "Evening" &&
            slotInfo.slot.name == "Evening"
          ) {
            slot.exams.push(courseGroup);
          }
          return slot;
        });
        exams.map((e) => {
          if (e.day.toLowerCase() == slotInfo.day.toLowerCase()) {
            return existingDay;
          }
          return e;
        });
      }
      setScheduledExams(exams);
      let newUnscheduled = [...unscheduledExams];

      newUnscheduled = newUnscheduled
        .map((ex) => {
          if (ex.id === courseGroup.courseId) {
            const filteredGroups = ex.groups.filter(
              (g) => g.id !== courseGroup.id
            );
            if (filteredGroups.length > 0) {
              return {
                ...ex,
                groups: [filteredGroups[0]],
              };
            } else {
              // Will be filtered out in the next step
              return null;
            }
          }
          console.log(ex);
          return ex;
        })
        .filter((ex): ex is UnscheduledCourseEnhanced => ex !== null);

      setUnScheduledExams(newUnscheduled);
    }
    setDraggedCourse(null);
    setSelectedSlotInfo(null);
    setDraggedCourseGroup(null);
    setExistingDraggedExamGroup(null)
  };

  const getCourseForSlot = (slotId: string) => {
    return assignedCourses.find((assigned) => assigned.slotId === slotId);
  };

  // Get unique dates from time slots
  const uniqueDates = [...new Set(timeSlots.map((slot) => slot.date))];
  const removeCourseFromSlot = (slotInfo: any) => {
    setScheduledExams((prevScheduledExams) => {
      let removedGroup: any = null;
      let removedCourseId: string | null = null;

      // Update scheduled exams by removing the specified group
      const updatedScheduledExams = prevScheduledExams
        .map((day) => {
          if (day.day.toLowerCase() === slotInfo.day.toLowerCase()) {
            const updatedSlots = day.exams
              .map((slot) => {
                if (slot.name === slotInfo.name) {
                  // Find the exam to remove
                  const examIndex = slot.exams.findIndex(
                    (exam) => exam.group.id === slotInfo.group_id
                  );

                  if (examIndex !== -1) {
                    // Store the removed group and course ID
                    removedGroup = slot.exams[examIndex].group;
                    removedCourseId = slot.exams[examIndex].courseId;

                    // Remove the exam from the slot
                    return {
                      ...slot,
                      exams: slot.exams.filter(
                        (_, index) => index !== examIndex
                      ),
                    };
                  }
                }
                return slot;
              })
              .filter((slot) => slot.exams.length > 0);

            return {
              ...day,
              exams: updatedSlots,
            };
          }
          return day;
        })
        .filter((day) => day.exams.length > 0);

      // Add the removed group back to unscheduled exams
      if (removedGroup && removedCourseId) {
        setUnScheduledExams((prevUnscheduledExams) => {
          // Check if the course already exists in unscheduled exams
          const existingCourseIndex = prevUnscheduledExams.findIndex(
            (exam) => exam.id === removedCourseId
          );

          if (existingCourseIndex !== -1) {
            // Add the group to the existing course
            return prevUnscheduledExams.map((exam, index) => {
              if (index === existingCourseIndex) {
                return {
                  ...exam,
                  exam: exam,
                  group: removedGroup,
                  groups: [...exam.groups, removedGroup],
                };
              }
              return exam;
            });
          } else {
            // Create a new entry in unscheduled exams
            return [
              ...prevUnscheduledExams,
              {
                id: removedCourseId as string,

                group: removedGroup,
                course: removedGroup.course,
                groups: [removedGroup],
              } as UnscheduledCourseEnhanced,
            ];
          }
        });
      }
      return updatedScheduledExams;
    });
  };
  useEffect(() => {
    setUnScheduled([]);
  }, []);

  useEffect(() => {
    getExams(), getUnscheduledExams();
  }, []);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div
        className={`grid grid-cols-1 ${
          unscheduledExams.length > 0 && "lg:grid-cols-3"
        } gap-2 ${
          serverLoadingMessage?.isServerLoading &&
          "pointer-events-none opacity-20"
        }`}
      >
        {unscheduledExams.length > 0 && (
          <div className="lg:col-span-1">
            <div className="rounded-md shadow-lg p-2 sticky top-2">
              <h2 className="text-xl font-bold mb-4">
                Unscheduled courses with groups
              </h2>

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

              <ScrollArea className="h-[70vh] rounded-md border p-4 space-y-2 ">
                {allUnscheduled.map((exam) => (
                  <div
                    key={exam.course.id}
                    className="p-3  rounded-lg border border-gray-200 "
                  >
                    <div
                      className="flex justify-between items-start "
                      draggable
                      onDragStart={(e) => handleDragStart(e, exam)}
                    >
                      <div className="hover:opacity-45 hover:border-blue-300 cursor-move transition-all duration-200 m-2">
                        <div className="flex flex-col-reverse align-middle py-2">
                          {" "}
                          <h3 className="font-semibold text-sm flex-1 overflow-hidden">
                            {exam.course.title}
                          </h3>
                          <Grip className="translate-x-3.5 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center space-x-2">
                      {exam.groups.map((e_group, idx) => {
                        return (
                          <Badge
                            key={idx}
                            variant={"outline"}
                            draggable
                            onDragStart={(e) =>
                              handleCourseGroupDragStart(e, {
                                ...e_group,
                                courseId: exam.id,
                              })
                            }
                            className="w-auto hover:opacity-45 hover:border-blue-300 cursor-move transition-all duration-200 m-2"
                          >
                            <Grip className="h-4 w-4" />
                            {e_group.group.group_name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="grid grid-cols-3 w-full gap-2 lg:col-span-2">
          {scheduledExams.map((date, idx) => {
            return (
              <Card
                key={idx}
                className="shadow-md cursor-pointer overflow-hidden relative flex border h-full"
              >
                {/* Date Header */}
                <div className="text-center mb-1">
                  <h2 className="text-lg font-bold">{date.day}</h2>
                </div>

                {/* Time Slots */}
                <div>
                  {date.exams.map((slot, idx) => {
                    return (
                      <Card
                        key={idx}
                        className="shadow-md cursor-pointer overflow-hidden relative flex border m-1.5"
                        onDragOver={handleDragOver}
                        onDrop={(e) =>
                          handleDroppedCourse(e, { day: date.day, slot: slot })
                        }
                      >
                        {/* Time Period Header */}
                        <div className="p-2 text-center border-b border-gray-300">
                          <h3 className="text-lg font-bold">{slot.name}</h3>
                          {/* <p className="text-sm">{slot.startTime} - {slot.endTime}</p> */}
                        </div>

                        {/* Course Drop Zone */}
                        <div
                          className={`
                              w-full z-50 relative cursor-pointer border group rounded-lg flex flex-col flex-grow shadow-sm hover:shadow-md transition-shadow duration-200
                              ${
                                slot.exams
                                  ? ""
                                  : "border-2 border-dashed border-gray-400 hover:border-blue-400 hover:opacity-40 m-2"
                              }
                            `}
                        >
                          {slot.exams ? (
                            <div className="flex-grow flex flex-col gap-2 w-full">
                              <div className="flex justify-between">
                                <Badge
                                  variant="outline"
                                  className="hover:bg-default-200 absolute right-2 text-xs top-2 transition duration-300"
                                  onClick={() => {
                                    setMoreExams(
                                      slot.exams.map((e: any) => {
                                        return {
                                          ...e,
                                          group: e.group.group_name,
                                          course: e.group.course.title,
                                        };
                                      })
                                    );
                                    setDialogOpen(!dialogOpen);
                                  }}
                                >
                                  +
                                  {slot.exams.length > 0
                                    ? slot.exams.length - 1
                                    : 0}
                                </Badge>

                                <Button
                                  onClick={() => {
                                    if (slot.exams.length > 0) {
                                      const lastExam =
                                        slot.exams[slot.exams.length - 1];
                                      removeExamCourse({
                                        day: date.day,
                                        name: slot.name,
                                        group_id: lastExam.group.id,
                                        courseId: lastExam.courseId,
                                      });
                                    }
                                  }}
                                  variant={"outline"}
                                  className="text-gray-500 hover:text-gray-400 ml-2 p-1 rounded hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  {/* <p className="text-sm mt-1">{assignedCourse.department.name}</p> */}
                                  {slot.exams[slot.exams.length - 1] && (
                                    <Popover>
                                      <PopoverTrigger
                                        asChild
                                        className="max-w-[500px]"
                                      >
                                        <Badge
                                          variant={"outline"}
                                          className="p-2 m-0.3 rounded flex-grow overflow-hidden"
                                          onClick={() => {
                                            setMoreExams(
                                              slot.exams.map((e: any) => {
                                                return {
                                                  ...e,
                                                  group: e.group.group_name,
                                                  real_group: e.group,
                                                  course: e.group.course.title,
                                                };
                                              })
                                            );
                                            // setDialogOption({ option: "more" });
                                            // setDialogOpen(!dialogOpen);
                                          }}
                                        >
                                          {slot.exams.length > 0 &&
                                            slot.exams[slot.exams.length - 1]
                                              .group.course.title}
                                        </Badge>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="max-w-[500px] p-0"
                                        align="center"
                                      >
                                        <ScrollArea className="h-[50vh] rounded-md border p-4">
                                          {moreExams.length > 0 ? (
                                            moreExams.map((exam) => (
                                              <Badge
                                                variant={"outline"}
                                                className="w-full p-2 m-1  rounded flex-grow overflow-hidden font-medium"
                                                draggable
                                                onDragStart={(e) =>
                                                  handleExistingCourseGroupDragStart(
                                                    e,
                                                    {
                                                      exam: exam,
                                                      group: exam.group,
                                                      course: exam.group.course,
                                                      courseId: exam.id,
                                                    }
                                                  )
                                                }
                                              >
                                                {exam.course} - Group{" "}
                                                {exam.group.group_name}
                                              </Badge>
                                            ))
                                          ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                              <CalendarIcon className="h-12 w-12 text-primary mb-2" />
                                              <p className="text-lg font-medium text-primary">
                                                No exam found
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                There are no exams scheduled for
                                                this day.
                                              </p>
                                            </div>
                                          )}
                                        </ScrollArea>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-2">
                              <Calendar className="w-4 h-4 mx-auto mb-2 opacity-50" />
                              <p className="text-sm font-medium">
                                Drag course here
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {dialogOption?.option == "more" && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              More Exams
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed  text-center">
              The more exams scheduled in selected slot
            </DialogDescription>
          </DialogHeader>

          {/* <ShowMoreExamsModal data={moreExams} /> */}
        </DialogContent>
      )}
      {dialogOption?.option == "conflict" && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              Conflicts Found
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed  text-center">
              The conflict that restrain this course from scheduled on this
              date.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <ScrollArea className="max-h-[50] h-fit rounded-md border p-4">
              {conflictMessage && conflictMessage.length > 0 ? (
                conflictMessage.map((conflictedGroup) => {
                  return (
                    <Badge
                      variant={"outline"}
                      className="w-full p-2 m-1  rounded flex-grow overflow-hidden font-medium"
                    >
                      {conflictedGroup[0].course.title}{" "}
                      {conflictedGroup[0].group_name} -{" "}
                      {conflictedGroup[1].course.title}{" "}
                      {conflictedGroup[1].group_name} - {conflictedGroup[2]}
                    </Badge>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Trash className="h-12 w-12 text-primary mb-2" />
                  <p className="text-lg font-medium text-primary">
                    No conflicts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    There are no conflicts found.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            Do you want to continue scheduling?
            <Button variant={"outline"} onClick={scheduleCourse}>
              Yes
            </Button>{" "}
            <Button
              variant={"secondary"}
              onClick={() => {
                setDraggedCourse(null);
                setDialogOpen(false);
                setSelectedSlotInfo(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default ManualTimeTable;
