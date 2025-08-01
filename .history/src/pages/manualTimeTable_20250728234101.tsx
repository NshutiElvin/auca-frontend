import React, { useState, useEffect, useTransition } from "react";
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
import { se, sl } from "date-fns/locale";
import { format, set } from "date-fns";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { PopoverClose } from "@radix-ui/react-popover";

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
interface Suggestion {
  suggested: boolean;
  date: string;
  slot: string;
}

interface BestSuggestion {
  date: string;
  slot: string;
}
function ManualTimeTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [draggedCourseGroup, setDraggedCourseGroup] = useState<any>(null);
  const axios = useUserAxios();
  const { setServerLoadingMessage, setToastMessage, serverLoadingMessage } =
    useToast();
  const [timeSlots, setTimeSlots] = useState<Slot[]>([]);
  const { setUnScheduled } = useExamsSchedule();
  const [unscheduledExams, setUnScheduledExams] = useState<
    UnscheduledCourseEnhanced[]
  >([]);

  const [moreExams, setMoreExams] = useState<MyExam[]>([]);
  const [existingDraggedExamGroup, setExistingDraggedExamGroup] =
    useState<MyExam | null>(null);
  const [scheduledExams, setScheduledExams] = useState<DailyExam[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogOption, setDialogOption] = useState<DialogOption | null>(null);
  const [conflictMessage, setConflictMessage] = useState<any[] | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [bestSuggestion, setBestSuggestion] = useState<BestSuggestion | null>(
    null
  );
  const [suggesstedSlot, setSuggesstedSlot] = useState<{
    date: string;
    slot: string;
  } | null>(null);

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
    console.log(group);
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
              setSuggestions(resp.data.all_suggestions);
              setBestSuggestion(resp.data.best_suggestion);
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
            setSuggestions(resp.data.all_suggestions);
            setBestSuggestion(resp.data.best_suggestion);
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
    } else if (existingDraggedExamGroup) {
      try {
        setServerLoadingMessage({
          message: `Processing`,
          isServerLoading: true,
        });
        const resp = await axios.post("/api/exams/exams/add-exam-to-slot/", {
          ...slotInfo,
          course_group: existingDraggedExamGroup,
        });

        if (resp.data.success) {
          if (resp.data.conflict) {
            setConflictMessage(resp.data.data);
            setSuggestions(resp.data.all_suggestions);
            setBestSuggestion(resp.data.best_suggestion);
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
            suggestedSlot: suggesstedSlot,
          }
        );

        if (resp.data.success) {
          setToastMessage({ message: resp.data.message, variant: "success" });
          // await getExams();
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
        setExistingDraggedExamGroup(null);
        setSuggesstedSlot(null);
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
        setExistingDraggedExamGroup(null);
        setSuggesstedSlot(null);
      }
    } else if (existingDraggedExamGroup) {
      try {
        setDialogOpen(false);
        setServerLoadingMessage({
          message: `Scheduling Exam`,
          isServerLoading: true,
        });
        const resp = await axios.post(
          "/api/exams/exams/schedule-existing-course-single-group/",
          {
            ...selectedSlotInfo,
            course_group: existingDraggedExamGroup,
          }
        );

        if (resp.data.success) {
          setToastMessage({ message: resp.data.message, variant: "success" });
          await getExams();
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
        setExistingDraggedExamGroup(null);
        setSuggesstedSlot(null);
      }
    }
  };

  const removeExamCourse = async (e: any, courseExamInfo: any) => {
    e.preventDefault();
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
        // setUnScheduledExams(resp.data.unscheduled);
        await Promise.all([await getUnscheduledExams(), await getExams()]);
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
    if (suggesstedSlot) {
    }
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
    setExistingDraggedExamGroup(null);
    setSuggesstedSlot(null);
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

  useEffect(() => {
    setUnScheduledExams([]);
    setAssignedCourses([]);
    setScheduledExams([]);
    setTimeSlots([]);
    setDraggedCourse(null);
    setDraggedCourseGroup(null);
    setExistingDraggedExamGroup(null);
    setSelectedSlotInfo(null);
    setDialogOpen(false);
    setDialogOption(null);
    setConflictMessage(null);
    setSuggestions(null);
    setBestSuggestion(null);
    setSuggesstedSlot(null);
  }, []);

  useEffect(() => {
    if (bestSuggestion) {
      setSuggesstedSlot({
        date: bestSuggestion?.date,
        slot: bestSuggestion?.slot,
      });
    }
  }, [bestSuggestion]);

  useEffect(() => {
    if (selectedSlotInfo && suggesstedSlot) {
      setSelectedSlotInfo({
        ...selectedSlotInfo,
        day: suggesstedSlot.date,
        slot: {
          ...selectedSlotInfo.slot,
          name: suggesstedSlot.slot,
        },
      });
    }
  }, [suggesstedSlot]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        setDialogOpen(!dialogOpen);
        setDraggedCourse(null);
        setDialogOpen(false);
        setSelectedSlotInfo(null);
        setExistingDraggedExamGroup(null);
        setDraggedCourseGroup(null);
        setSuggesstedSlot(null);
      }}
    >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 lg:col-span-2">
          {scheduledExams.map((date, idx) => {
            let dateObj = new Date(date.day);

            return (
              <Card
                key={idx}
                className="shadow-md cursor-pointer overflow-hidden relative flex flex-col border h-full min-h-[400px]"
              >
                {/* Date Header */}
                <div className="text-center py-4 px-3 bg-gray-50 border-b sticky top-0 z-10">
                  <h2 className="text-lg font-bold text-gray-900">
                    {format(dateObj, "eee")}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(dateObj, "dd MMM yyyy")}
                  </p>
                </div>

                {/* Time Slots Container */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-3 p-3">
                    {date.exams.map((slot, slotIdx) => (
                      <Card
                        key={slotIdx}
                        className="shadow-sm cursor-pointer overflow-hidden relative border transition-all duration-200 hover:shadow-md"
                        onDragOver={handleDragOver}
                        onDrop={(e) =>
                          handleDroppedCourse(e, { day: date.day, slot: slot })
                        }
                      >
                        {/* Time Period Header */}
                        <div className="px-3 py-2  border-b">
                          <h3 className="text-sm font-semibold   text-center">
                            {slot.name}
                          </h3>
                        </div>

                        {/* Course Drop Zone */}
                        <div
                          className={`
                    relative min-h-[80px] cursor-pointer transition-all duration-200
                    ${
                      slot.exams
                        ? "bg-inherit"
                        : "border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 m-2 rounded-md"
                    }
                  `}
                        >
                          {slot.exams ? (
                            <div className="p-3 space-y-2">
                              {/* Action Buttons */}
                              <div className="flex justify-between items-start mb-2">
                                <Badge
                                  variant="outline"
                                  className="hover:bg-inherit text-xs cursor-pointer transition-colors duration-200 px-2 py-1"
                                  onClick={() => {
                                    setMoreExams(
                                      slot.exams.map((e: any) => ({
                                        ...e,
                                        group: e.group.group_name,
                                        course: e.group.course.title,
                                      }))
                                    );
                                  }}
                                >
                                  +
                                  {slot.exams.length > 0
                                    ? slot.exams.length - 1
                                    : 0}
                                </Badge>

                                <Button
                                  onClick={(e) => {
                                    if (slot.exams.length > 0) {
                                      const lastExam =
                                        slot.exams[slot.exams.length - 1];
                                      removeExamCourse(e, {
                                        day: date.day,
                                        name: slot.name,
                                        group_id: lastExam.group.id,
                                        courseId: lastExam.courseId,
                                      });
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-300 h-6 w-6 p-0 transition-colors duration-200"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Course Information */}
                              <div className="space-y-2">
                                {slot.exams[slot.exams.length - 1] && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="w-full p-2 text-left cursor-pointer hover:bg-gray-20 transition-colors duration-200 justify-start min-h-[36px] text-wrap break-words"
                                        onClick={() => {
                                          setMoreExams(
                                            slot.exams.map((e: any) => ({
                                              ...e,
                                              group: e.group,
                                              real_group: e.group,
                                              course: e.group.course.title,
                                            }))
                                          );
                                        }}
                                      >
                                        <span className="font-medium text-sm leading-tight">
                                          {slot.exams.length > 0 &&
                                            slot.exams[slot.exams.length - 1]
                                              .group.course.title}
                                        </span>
                                      </Badge>
                                    </PopoverTrigger>

                                    <PopoverContent
                                      className="w-[400px] max-w-[90vw] p-0"
                                      align="center"
                                      side="top"
                                    >
                                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-900">
                                            Scheduled Exams
                                          </h4>
                                          <p className="text-xs text-gray-500">
                                            {slot.name} •{" "}
                                            {format(dateObj, "eee, dd MMM")}
                                          </p>
                                        </div>
                                        <PopoverClose asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </PopoverClose>
                                      </div>

                                      <ScrollArea className="max-h-[300px] overflow-y-auto">
                                        <div className="p-3 space-y-2">
                                          {moreExams.length > 0 ? (
                                            moreExams.map((exam, examIdx) => (
                                              <div
                                                key={examIdx}
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-30 transition-colors duration-200"
                                              >
                                                <Badge
                                                  variant="outline"
                                                  className="flex-1 p-2 cursor-move hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 justify-start text-left"
                                                  draggable
                                                  onDragStart={(e) =>
                                                    handleExistingCourseGroupDragStart(
                                                      e,
                                                      {
                                                        exam: exam,
                                                        group: exam.group,
                                                        course:
                                                          exam.group.course,
                                                        courseId: exam.id,
                                                      }
                                                    )
                                                  }
                                                >
                                                  <div className="space-y-1">
                                                    <div className="font-medium text-sm">
                                                      {exam.course}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      Group{" "}
                                                      {exam.group.group_name}
                                                    </div>
                                                  </div>
                                                </Badge>

                                                <Button
                                                  onClick={async (e) => {
                                                    if (slot.exams.length > 0) {
                                                      try {
                                                        await removeExamCourse(
                                                          e,
                                                          {
                                                            day: date.day,
                                                            name: slot.name,
                                                            group_id:
                                                              exam.group.id,
                                                            courseId:
                                                              exam.group.course
                                                                .id,
                                                          }
                                                        );

                                                        // Update moreExams state after successful deletion
                                                        setMoreExams((prev) =>
                                                          prev.filter(
                                                            (e) =>
                                                              e.group.id !==
                                                              exam.group.id
                                                          )
                                                        );

                                                        // If this was the last exam, close the popover
                                                        if (
                                                          moreExams.length === 1
                                                        ) {
                                                          document.dispatchEvent(
                                                            new KeyboardEvent(
                                                              "keydown",
                                                              { key: "Escape" }
                                                            )
                                                          );
                                                        }
                                                      } catch (error) {
                                                        setToastMessage({
                                                          message:
                                                            String(error),
                                                          variant: "danger",
                                                        });
                                                      }
                                                    }
                                                  }}
                                                  variant="outline"
                                                  size="sm"
                                                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-300 h-8 w-8 p-0 flex-shrink-0 transition-colors duration-200"
                                                >
                                                  <X className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                              <CalendarIcon className="h-10 w-10 text-gray-400 mb-3" />
                                              <p className="text-sm font-medium text-gray-600">
                                                No exams found
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                There are no exams scheduled for
                                                this slot.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </ScrollArea>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                              <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                              <p className="text-xs font-medium text-gray-500">
                                Drag course here
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
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
        <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="text-center space-y-3 pb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-bold leading-tight text-center">
              Conflict Detected:
              {` `}
              {draggedCourse?.course?.title ||
                (draggedCourseGroup && draggedCourseGroup?.course?.title)}
              {draggedCourse?.course?.group?.group_name ||
              (draggedCourseGroup &&
                draggedCourseGroup?.course?.group?.group_name)
                ? ` (${
                    draggedCourse?.course?.group?.group_name ||
                    draggedCourseGroup?.course?.group?.group_name
                  })`
                : ""}
              {` `}
              for the {selectedSlotInfo?.slot?.name} slot on{" "}
              {selectedSlotInfo?.day
                ? format(new Date(selectedSlotInfo.day), "dd MMM yyyy")
                : ""}
            </DialogTitle>
            <DialogDescription className="text-sm  text-center">
              The following conflicts prevent this course from being scheduled
              on the selected date and slot.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            {/* Conflicts Section */}
            <div className="space-y-3">
              <h3 className="text-sm text-center px-1 mb-1">
                Conflicts for the Entire Day
              </h3>
              <ScrollArea className="max-h-[200px] rounded-md border">
                <div className="p-4 space-y-2">
                  {conflictMessage && conflictMessage.length > 0 ? (
                    conflictMessage.map((conflictedGroup, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="w-full p-3 rounded-md flex justify-between items-center text-left font-medium hover:bg-gray-30 transition-colors"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="font-semibold">
                            {conflictedGroup[0].course.title}
                          </span>
                          <span className="text-gray-600 mx-1">
                            {conflictedGroup[0].group_name}
                          </span>

                          <span className="text-gray-400">vs</span>
                          <span className="font-semibold mx-1">
                            {conflictedGroup[1].course.title}
                          </span>
                          <span className="text-gray-600">
                            {conflictedGroup[1].group_name}
                          </span>
                          <span className="font-semibold mx-1">
                            {conflictedGroup[0]?.slot}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {conflictedGroup[2]}
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Trash className="h-12 w-12 text-primary mb-3" />
                      <p className="text-lg font-medium text-primary">
                        No conflicts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        There are no conflicts found.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Best Suggestion Section */}
            <div className="space-y-3">
              <h3 className="text-sm  text-center px-1">Best Suggested Slot</h3>
              <div className="rounded-md border">
                <div className="p-4">
                  {bestSuggestion ? (
                    <Badge
                      variant="outline"
                      className="w-full p-4 rounded-md flex items-center justify-center font-medium bg-blue-50 border-blue-200 text-blue-800"
                    >
                      <span className="text-center">
                        <span className="font-semibold">
                          {bestSuggestion.slot}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {format(new Date(bestSuggestion.date), "eee")}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {format(new Date(bestSuggestion.date), "dd MMM yyyy")}
                        </span>
                      </span>
                    </Badge>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Trash className="h-12 w-12 text-primary mb-3" />
                      <p className="text-lg font-medium text-primary">
                        No suggested slots
                      </p>
                      <p className="text-sm text-muted-foreground">
                        There are no suggested slots available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Other Suggestions Section */}
            <div className="space-y-3">
              <h3 className="text-sm text-center px-1">
                Alternative Suggested Slots
              </h3>
              <div className="rounded-md border">
                <div className="p-4">
                  {suggestions && suggestions.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const [date, slot] = value.split(" ");
                        setSuggesstedSlot({ date, slot });
                      }}
                    >
                      <SelectTrigger className="w-full h-12 text-left">
                        <SelectValue placeholder="Select an alternative time slot" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        {bestSuggestion && (
                          <SelectGroup>
                            <SelectLabel className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Recommended
                            </SelectLabel>
                            <SelectItem
                              value={`${bestSuggestion?.date} ${bestSuggestion?.slot}`}
                              className="px-3 py-3 cursor-pointer hover:bg-blue-50"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  <span className="font-medium">
                                    {bestSuggestion.slot}
                                  </span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span>
                                    {format(
                                      new Date(bestSuggestion.date),
                                      "eee"
                                    )}
                                  </span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span>
                                    {format(
                                      new Date(bestSuggestion.date),
                                      "dd MMM yyyy"
                                    )}
                                  </span>
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                                  Recommended
                                </span>
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        )}

                        <SelectGroup>
                          <SelectLabel className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Other Options
                          </SelectLabel>
                          <div className="max-h-[300px] overflow-y-auto">
                            {suggestions.map((suggestion, idx) => (
                              <SelectItem
                                key={idx}
                                value={`${suggestion.date} ${suggestion.slot}`}
                                className="px-3 py-3 cursor-pointer hover:bg-gray-50"
                              >
                                <span>
                                  <span className="font-medium">
                                    {suggestion.slot}
                                  </span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span>
                                    {format(new Date(suggestion.date), "eee")}
                                  </span>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span>
                                    {format(
                                      new Date(suggestion.date),
                                      "dd MMM yyyy"
                                    )}
                                  </span>
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Trash className="h-12 w-12 text-primary mb-3" />
                      <p className="text-lg font-medium text-primary">
                        No alternative slots
                      </p>
                      <p className="text-sm text-muted-foreground">
                        There are no alternative slots available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-6 p-4 border-t bg-gray-800">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium">
                  Would you like to proceed with scheduling this exam?
                </p>
                <p className="text-sm text-gray-400">
                  If you click "Yes", the exam will be scheduled in the best
                  suggested slot unless you choose a different one above.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={scheduleCourse}
                  className="px-6 py-2 font-medium"
                >
                  Yes, Continue
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraggedCourse(null);
                    setDialogOpen(false);
                    setSelectedSlotInfo(null);
                    setExistingDraggedExamGroup(null);
                    setDraggedCourseGroup(null);
                    setSuggesstedSlot(null);
                  }}
                  className="px-6 py-2 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default ManualTimeTable;
