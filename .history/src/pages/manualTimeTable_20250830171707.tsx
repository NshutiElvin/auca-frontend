import React, {
  useState,
  useEffect,
  useTransition,
  useRef,
  useContext,
} from "react";
import {
  Search,
  Calendar,
  X,
  Grip,
  Trash,
  CalendarIcon,
  List,
  ListCollapse,
  Pencil,
  Loader2,
 
} from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import { Input } from "../components/ui/input";
import { Exam, MyExam } from "./exams";
import { Badge } from "../components/ui/badge";
import {
  CourseGroup,
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
import { ScrollArea } from "../components/scroll-area";
import { Button } from "../components/ui/button";
import useToast from "../hooks/useToast";

import { format, set } from "date-fns";

import Draggable from "react-draggable";
import { ConflictDialog } from "./ConflictsDialog";
import { useSidebar } from "../components/ui/sidebar";
import { Label } from "../components/ui/label";
import LocationContext from "../contexts/LocationContext";
import { is } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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

interface SlotExam {
  start?: string;
  end?: string;
  date?: string;
  name: "Morning" | "Afternoon" | "Evening";
  exams: any[];
}
interface DailyExam {
  day: string;

  exams: SlotExam[];
}

interface DialogOption {
  option: "more" | "conflict" | "group-conflict" | "changeTime";
}
interface Suggestion {
  suggested: boolean;
  date: string;
  slot: string;
  reason?: string;
}

interface BestSuggestion {
  date: string;
  slot: string;
}
function ManualTimeTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [backupDraggedCourse, setBackupDraggedCourse] = useState<any>(null);
  const [draggedCourseGroup, setDraggedCourseGroup] = useState<any>(null);
  const [backupdraggedCourseGroup, setBackupDraggedCourseGroup] =
    useState<any>(null);
  const { setOpen } = useSidebar();
  const [currentSlotMeta, setCurrentSlotMeta] = useState<any | null>({
    day: "",
    name: "",
  });
  const axios = useUserAxios();
  const { setServerLoadingMessage, setToastMessage, serverLoadingMessage } =
    useToast();
  const [timeSlots, setTimeSlots] = useState<Slot[]>([]);
  const { setUnScheduled } = useExamsSchedule();
  const [viewAllSuggestions, setViewAllSuggestions] = useState<boolean>(false);
  const [unscheduledExams, setUnScheduledExams] = useState<
    UnscheduledCourseEnhanced[]
  >([]);
  const [moreExams, setMoreExams] = useState<any[]>([]);
  const [existingDraggedExamGroup, setExistingDraggedExamGroup] =
    useState<MyExam | null>(null);
  const [scheduledExams, setScheduledExams] = useState<DailyExam[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogOption, setDialogOption] = useState<DialogOption | null>(null);
  const [conflictMessage, setConflictMessage] = useState<any[] | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any | null>(null);
  const [backupSelectedSlotInfo, setBackupSelectedSlotInfo] = useState<
    any | null
  >(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [bestSuggestion, setBestSuggestion] = useState<BestSuggestion | null>(
    null
  );
  const [conflictedStudents, setConflictedStudents] = useState<any[]>([]);
  const [showUnscheduled, setShowUnscheduled] = useState(true);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showConflicts, setShowConflicts] = useState<boolean>(false);
  const [conflictedCOurses, setConflictedCourses] = useState<any[]>([]);
  const [isLoadingUnscheduled, setIsLoadingUnscheduled] =
    useState<boolean>(false);
  const [suggesstedSlot, setSuggesstedSlot] = useState<{
    date: string;
    slot: string;
  } | null>(null);
  const [slotToChange, setSlotToChange] = useState<any | null>(null);
  const [isChangingTime, startChangingTimeTransition] = useTransition();
  const [isReviewingConflict, startReviewingConflictTransition] =
    useTransition();
  const [isAllowedToReview, setIsAllowedToReview] = useState<boolean>(false);
  const { selectedLocation } = useContext(LocationContext);

  const modalRef = useRef(null);

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

  const getUnscheduledExams = async () => {
    try {
      setIsLoadingUnscheduled(true);
      let resp = null;
      if (selectedLocation)
        resp = await axios.get(
          `api/exams/exams/unscheduled_exams?location=${selectedLocation.id}`
        );
      else {
        resp = await axios.get("api/exams/exams/unscheduled_exams");
      }
      if (resp.data.success) {
        setUnScheduledExams(resp.data.data);
      }
    } catch (error) {
      setToastMessage({ message: String(error), variant: "danger" });
    } finally {
      setIsLoadingUnscheduled(false);
    }
  };

  const handleCloseShowMore = () => {
    setCurrentSlotMeta(null);
    setShowMore(false);
    setMoreExams([]);
  };

  const handleCloseConflicts = () => {
    setShowConflicts(false);
    setConflictedStudents([]);
  };

  const resetAllStates = () => {
    setServerLoadingMessage({ isServerLoading: false });
    setDraggedCourse(null);
    setSelectedSlotInfo(null);
    setDraggedCourseGroup(null);
    setExistingDraggedExamGroup(null);
    setSuggesstedSlot(null);
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
            if (slot.name == "Morning" && ex.slot_name == "Morning") {
              slot.date = ex.date;
              slot.start = ex.start_time;
              slot.end = ex.end_time;
              slot.exams.push(ex);
            } else if (
              slot.name == "Afternoon" &&
              ex.slot_name == "Afternoon"
            ) {
              slot.date = ex.date;
              slot.start = ex.start_time;
              slot.end = ex.end_time;
              slot.exams.push(ex);
            } else if (slot.name == "Evening" && ex.slot_name == "Evening") {
              slot.date = ex.date;
              slot.start = ex.start_time;
              slot.end = ex.end_time;
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
              { name: "Morning", start: "", end: "", date: "", exams: [] },
              { name: "Afternoon", start: "", end: "", date: "", exams: [] },
              { name: "Evening", start: "", end: "", date: "", exams: [] },
            ],
          };
          if (ex.slot_name == "Morning") {
            newDay.exams[0].exams.push(ex);
            newDay.exams[0].date = ex.date;
            newDay.exams[0].start = ex.start_time;
            newDay.exams[0].end = ex.end_time;
          } else if (ex.slot_name == "Afternoon") {
            newDay.exams[1].exams.push(ex);
            newDay.exams[1].date = ex.date;
            newDay.exams[1].start = ex.start_time;
            newDay.exams[1].end = ex.end_time;
          } else if (ex.slot_name == "Evening") {
            newDay.exams[2].date = ex.date;
            newDay.exams[2].exams.push(ex);
            newDay.exams[2].start = ex.start_time;
            newDay.exams[2].end = ex.end_time;
          }

          exams.push(newDay);
        }
      });

      setScheduledExams(exams);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragStart = (e: React.DragEvent, course: any) => {
    const dragPreview = document.createElement("div");
    dragPreview.style.position = "absolute";
    dragPreview.style.pointerEvents = "none";
    dragPreview.style.zIndex = "10000";
    dragPreview.style.backgroundColor = "#f0f9ff";
    dragPreview.style.border = "1px solid #0369a1";
    dragPreview.style.borderRadius = "6px";
    dragPreview.style.padding = "8px 12px";
    dragPreview.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    dragPreview.innerHTML = `
    <p style="margin:0; font-weight:500;">${course.course.title}</p>
    <p style="margin:0; font-size:0.8em; color:#64748b;">${course.groups.length} groups</p>
  `;

    document.body.appendChild(dragPreview);

    e.dataTransfer.setDragImage(dragPreview, dragPreview.offsetWidth / 2, 20);

    setTimeout(() => document.body.removeChild(dragPreview), 0);
    setDraggedCourse(course);
    setBackupDraggedCourse(course);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCourseGroupDragStart = (e: React.DragEvent, group: any) => {
    console.log(group);
    setDraggedCourseGroup({ ...group });
    setBackupDraggedCourseGroup({ ...group });
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

  const reviewConflicts = () => {
    if (isAllowedToReview) {
      startReviewingConflictTransition(async () => {
        try {
          if (draggedCourseGroup) {
            const resp = await axios.post(
              "/api/exams/exams/add-exam-to-slot/",
              {
                ...selectedSlotInfo,
                course_group: draggedCourseGroup,
              }
            );

            if (resp.data.success) {
              if (resp.data.conflict) {
                setConflictMessage(resp.data.data);
                // setBackupSelectedSlotInfo({...selectedSlotInfo})
              }
            } else {
              setToastMessage({
                message: resp.data.message,
                variant: "danger",
              });
            }
          } else if (draggedCourse) {
            const resp = await axios.post(
              "/api/exams/exams/add-exam-to-slot/",
              {
                ...selectedSlotInfo,
                course_group: draggedCourse,
              }
            );

            if (resp.data.success) {
              if (resp.data.conflict) {
                setConflictMessage(resp.data.data);
              }
            } else {
              setToastMessage({
                message: resp.data.message,
                variant: "danger",
              });
            }
          } else if (existingDraggedExamGroup) {
            const resp = await axios.post(
              "/api/exams/exams/add-exam-to-slot/",
              {
                ...selectedSlotInfo,
                course_group: existingDraggedExamGroup,
              }
            );

            if (resp.data.success) {
              if (resp.data.conflict) {
                setConflictMessage(resp.data.data);
                setSuggestions(resp.data.all_suggestions);
                setBestSuggestion(resp.data.best_suggestion);
                setDialogOption({ option: "conflict" });
                setDialogOpen(true);
              }
            } else {
              setToastMessage({
                message: resp.data.message,
                variant: "danger",
              });
            }
          }
        } catch (error) {
          console.error(error);
          setToastMessage({ message: "An error occurred", variant: "danger" });
        }
      });
    }
  };

  const scheduleCourse = async () => {
    if (!draggedCourse && !draggedCourseGroup && !existingDraggedExamGroup)
      return;

    try {
      setDialogOpen(false);
      setServerLoadingMessage({
        message: `Scheduling Exam`,
        isServerLoading: true,
      });

      let endpoint = "";
      let payload = { ...selectedSlotInfo };

      if (draggedCourse) {
        endpoint = "/api/exams/exams/schedule-course-group/";
        payload.course_group = draggedCourse;
        payload.suggestedSlot = suggesstedSlot;
      } else if (draggedCourseGroup) {
        endpoint = "/api/exams/exams/schedule-course-single-group/";
        payload.course_group = draggedCourseGroup;
      } else if (existingDraggedExamGroup) {
        endpoint = "/api/exams/exams/schedule-existing-course-single-group/";
        payload.course_group = existingDraggedExamGroup;
      }

      const resp = await axios.post(endpoint, payload);

      if (resp.data.success) {
        setToastMessage({ message: resp.data.message, variant: "success" });
        if (existingDraggedExamGroup) {
          await getExams();
        }
        handleDrop(selectedSlotInfo);
      } else {
        setToastMessage({ message: resp.data.message, variant: "danger" });
      }
    } catch (error) {
      getExams();
      getUnscheduledExams();
    } finally {
      resetAllStates();
    }
  };

  const changeExamTime = async () => {
    startChangingTimeTransition(async () => {
      try {
        const resp = await axios.patch("/api/exams/exams/changeTime/", {
          slotToChange,
        });

        if (resp.data.success) {
          await Promise.all([await getExams(), await getUnscheduledExams()]);

          setToastMessage({ message: resp.data.message, variant: "success" });
          setSlotToChange(null);
          setDialogOpen(false);
        } else {
          setToastMessage({ message: resp.data.message, variant: "danger" });
        }
      } catch (error) {
        setToastMessage({ message: String(error), variant: "danger" });
      }
    });
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
        await Promise.all([await getExams(), await getUnscheduledExams()]);
        setMoreExams((prev) =>
          prev.filter((e) => e.group.id !== courseExamInfo.group_id)
        );

        if (moreExams.length === 1) {
          handleCloseShowMore();
        }
        setToastMessage({ message: resp.data.message, variant: "success" });
        removeCourseFromSlot(courseExamInfo);
      } else {
        setToastMessage({ message: resp.data.message, variant: "danger" });
      }
    } catch (error) {
      setToastMessage({ message: String(error), variant: "danger" });
    } finally {
      setServerLoadingMessage({ isServerLoading: false });
    }
  };

  const handleDroppedCourse = async (e: React.DragEvent, slotInfo: any) => {
    e.preventDefault();
    console.log(slotInfo);
    setSelectedSlotInfo(slotInfo);
    setBackupSelectedSlotInfo(slotInfo);

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
        getExams();
        getUnscheduledExams();
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
        getExams();
        getUnscheduledExams();
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
        getExams();
        getUnscheduledExams();
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
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
    setBackupDraggedCourse(null);
    setBackupDraggedCourseGroup(null);
    setSelectedSlotInfo(null);
    setBackupSelectedSlotInfo(null);
    setDraggedCourseGroup(null);
    setExistingDraggedExamGroup(null);
    setSuggesstedSlot(null);
  };

  const removeCourseFromSlot = (slotInfo: any) => {
    setScheduledExams((prevScheduledExams) => {
      let removedGroup: any = null;
      let removedCourseId: string | null = null;

      const updatedScheduledExams = prevScheduledExams
        .map((day) => {
          if (day.day.toLowerCase() === slotInfo.day.toLowerCase()) {
            const updatedSlots = day.exams
              .map((slot) => {
                if (slot.name === slotInfo.name) {
                  const examIndex = slot.exams.findIndex(
                    (exam) => exam.group.id === slotInfo.group_id
                  );

                  if (examIndex !== -1) {
                    removedGroup = slot.exams[examIndex].group;
                    removedCourseId = slot.exams[examIndex].courseId;

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

      if (removedGroup && removedCourseId) {
        setUnScheduledExams((prevUnscheduledExams) => {
          const existingCourseIndex = prevUnscheduledExams.findIndex(
            (exam) => exam.id === removedCourseId
          );

          if (existingCourseIndex !== -1) {
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

  const isTimeBeforeOrEqual = (time1: string, time2: string) => {
    const [hours1, minutes1] = time1.split(":").map(Number);
    const [hours2, minutes2] = time2.split(":").map(Number);

    if (hours1 < hours2) return true;
    if (hours1 === hours2 && minutes1 <= minutes2) return true;
    return false;
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    let hours = endHours - startHours;
    let minutes = endMinutes - startMinutes;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    setOpen(false);
    getUnscheduledExams();
    getExams();
  }, []);

  useEffect(() => {
    setUnScheduledExams([]);
    setAssignedCourses([]);
    setScheduledExams([]);
    setTimeSlots([]);
    setDraggedCourse(null);
    setBackupDraggedCourse(null);
    setBackupDraggedCourseGroup(null);
    setDraggedCourseGroup(null);
    setExistingDraggedExamGroup(null);
    setSelectedSlotInfo(null);
    setBackupSelectedSlotInfo(null);
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

  useEffect(() => {
    reviewConflicts();
  }, [selectedSlotInfo]);

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
          setDraggedCourse(null);
          setBackupDraggedCourse(null);
          setBackupDraggedCourseGroup(null);
          setDialogOpen(false);
          setSelectedSlotInfo(null);
          setExistingDraggedExamGroup(null);
          setDraggedCourseGroup(null);
          setSuggesstedSlot(null);
          setConflictedStudents([]);
          setDialogOption(null);
          setSlotToChange(null);
          setIsAllowedToReview(false);
          setViewAllSuggestions(false);
        }}
      >
        {" "}
        {isLoadingUnscheduled && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-5 w-5 text-primary" /> loading
            unscheduled exam ...
          </div>
        )}
        <div
          className={`flex flex-col gap-2${
            serverLoadingMessage?.isServerLoading &&
            "pointer-events-none opacity-20"
          }`}
        >
          {unscheduledExams.length > 0 && showUnscheduled && (
            <div className="flex justify-start">
              <Button
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mr-2"
                aria-label="Notifications"
                onClick={() => setShowUnscheduled(!showUnscheduled)}
                variant={"outline"}
              >
                {showUnscheduled ? <ListCollapse /> : <List />}
                {unscheduledExams.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-xs  font-medium p-2">
                    {unscheduledExams.length > 9
                      ? "9+"
                      : unscheduledExams.length}
                  </span>
                )}
              </Button>
            </div>
          )}

          <div
            className={`grid grid-cols-1 ${
              unscheduledExams.length > 0 &&
              showUnscheduled &&
              "lg:grid-cols-3 w-full  "
            } gap-2 ${
              serverLoadingMessage?.isServerLoading &&
              "pointer-events-none opacity-20"
            }`}
          >
            {" "}
            {unscheduledExams.length > 0 && showUnscheduled && (
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
                      className="w-full pl-10 pr-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <ScrollArea className="h-[70vh] rounded-md border p-4 space-y-2 ">
                    {allUnscheduled.map((exam) => (
                      <div
                        key={exam.course.id}
                        className="p-3 mt-3 rounded-xl border border-primary shadow-sm bg-white"
                      >
                        {/* Exam Header */}
                        <div
                          className="flex justify-between items-center cursor-move hover:opacity-70 transition-all duration-200"
                          draggable
                          onDragStart={(e) => handleDragStart(e, exam)}
                        >
                          <div className="flex items-center space-x-2 w-full overflow-hidden">
                            <Grip className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-medium text-sm truncate">
                              {exam.course.title}
                            </h3>
                          </div>
                        </div>

                        {/* Exam Groups */}
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
                          {exam.groups.map((e_group, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              draggable
                              onDragStart={(e) =>
                                handleCourseGroupDragStart(e, {
                                  ...e_group,
                                  courseId: exam.id,
                                })
                              }
                              className="flex items-center gap-1 px-2 py-1 cursor-move hover:opacity-70 hover:border-blue-400 transition-all duration-200"
                            >
                              <Grip className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {e_group.group.group_name}
                              </span>
                            </Badge>
                          ))}
                        </div>

                        {/* Reason Badge */}
                        {exam.reason && (
                          <div className="flex justify-end mt-2">
                            <Badge
                              variant="destructive"
                              className="text-xs px-2 py-0.5"
                            >
                              {exam.reason}
                            </Badge>
                          </div>
                        )}
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
                    className="shadow-md cursor-pointer overflow-hidden relative flex flex-col border h-full min-h-[400px] p- w-full"
                  >
                    <div className="text-center py-2 px-2 bg-primary border-b sticky top-0 z-10 text-white">
                      <h2 className="text-lg font-bold">
                        {format(dateObj, "eee")}
                      </h2>
                      <p className="text-sm mt-1">
                        {format(dateObj, "dd MMM yyyy")}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-0">
                        {date.exams.map((slot, slotIdx) => (
                          <Card
                            key={slotIdx}
                            className="shadow-sm cursor-pointer overflow-hidden relative border-0 mt-0 transition-all duration-200 hover:shadow-md items-center p-0"
                            onDragOver={handleDragOver}
                            onDrop={(e) =>
                              handleDroppedCourse(e, {
                                day: date.day,
                                slot: slot,
                              })
                            }
                          >
                            <div className=" w-full p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex justify-between flex-wrap">
                              <h3 className="text-sm font-semibold   text-center ">
                                {slot.name}
                              </h3>

                              <Button
                                variant={"ghost"}
                                className="sm"
                                disabled={slot.exams.length <= 0}
                                onClick={() => {
                                  setDialogOption({ option: "changeTime" });
                                  setDialogOpen(true);
                                  setSlotToChange({
                                    name: slot.name,
                                    date: slot.date,
                                    start: slot.start,
                                    end: slot.end,
                                  });
                                }}
                              >
                                <Pencil className="h-2 w-2" />
                              </Button>
                            </div>
                            <Badge
                              variant={"secondary"}
                              className="items-center w-full"
                            >
                              {slot.start} - {slot.end}
                            </Badge>

                            <div
                              className={`
                    relative min-h-[80px] cursor-pointer transition-all duration-200 w-full
                    ${
                      slot.exams
                        ? "bg-inherit"
                        : "border-2 border-dashed border-primary hover:border-blue-400 hover:bg-blue-50/30 m-2 rounded-md"
                    }
                  `}
                            >
                              {slot.exams ? (
                                <div className="p-3 space-y-2 w-full">
                                  <div className="flex justify-between items-start mb-2">
                                    <Badge
                                      variant="outline"
                                      className="hover:bg-inherit text-xs cursor-pointer transition-colors duration-200 px-2 py-1 bg-primary text-white"
                                      onClick={() => {
                                        setMoreExams(
                                          slot.exams.map((e: any) => ({
                                            ...e,
                                            group: e.group.group_name,
                                            course: e.group.course.title,
                                          }))
                                        );
                                        setCurrentSlotMeta({
                                          day: date.day,
                                          name: slot.name,
                                        });
                                        setShowMore(true);
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
                                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 border-primary h-6 w-6 p-0 transition-colors duration-200"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>

                                  <div className="space-y-2 w-full">
                                    {slot.exams[slot.exams.length - 1] && (
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

                                          setCurrentSlotMeta({
                                            day: date.day,
                                            name: slot.name,
                                          });
                                          setShowMore(true);
                                        }}
                                      >
                                        <span className="font-medium text-sm leading-tight">
                                          {slot.exams.length > 0 &&
                                            slot.exams[slot.exams.length - 1]
                                              .group.course.title}
                                        </span>
                                      </Badge>
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

          {showMore && (
            <div>
              <Draggable
                handle=".drag-handle"
                cancel=".no-drag"
                nodeRef={modalRef}
              >
                <div
                  ref={modalRef}
                  className={`bg-background rounded-lg  z-50 relative shadow-md w-[500px] hover:z-[55] shadow-primary  ${
                    serverLoadingMessage?.isServerLoading &&
                    "pointer-events-none opacity-80"
                  } border animate-in border-primary shadow-primary  hover:z-[55] rounded-lg shadow-lg duration-200`}
                  style={{
                    position: "fixed",

                    top: "25%",
                    left: "40%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="p-3 border-b flex justify-between items-center drag-handle cursor-move   hover:shadow-lg
    transition-all
    duration-200
    
  "
                  >
                    <div className=" bg-primary w-full text-white">
                      <div className="p-2">
                        {" "}
                        <h4 className="font-semibold text-sm ">
                          Scheduled Exams
                        </h4>
                        <p className="text-xs">
                          {currentSlotMeta.name} •{" "}
                          {format(currentSlotMeta.day, "eee, dd MMM")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseShowMore}
                      className="ring-offset-background text-white focus:ring-ring  absolute top-5 right-8 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="max-h-[80vh] overflow-y-scroll ">
                    <div className="p-3 space-y-2 drag-handle cursor-move">
                      {moreExams.length > 0 ? (
                        moreExams.map((exam, examIdx) => (
                          <div
                            key={examIdx}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-30 transition-colors duration-200 no-drag"
                          >
                            <Badge
                              variant="outline"
                              className="flex-1 p-2 cursor-move hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 justify-start text-left"
                              draggable
                              onDragStart={(e) =>
                                handleExistingCourseGroupDragStart(e, {
                                  exam: exam,
                                  group: exam.group,
                                  course: exam.group.course,
                                  courseId: exam.id,
                                })
                              }
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {exam.course}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Group {exam.group.group_name}
                                </div>
                              </div>
                            </Badge>

                            <Button
                              onClick={async (e) => {
                                if (moreExams.length > 0) {
                                  try {
                                    await removeExamCourse(e, {
                                      day: currentSlotMeta.day,
                                      name: currentSlotMeta.name,
                                      group_id: exam.group.id,
                                      courseId: exam.group.course.id,
                                    });
                                  } catch (error) {
                                    setToastMessage({
                                      message: String(error),
                                      variant: "danger",
                                    });
                                  }
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50 border-primary h-8 w-8 p-0 flex-shrink-0 transition-colors duration-200"
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
                            There are no exams scheduled for this slot.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Draggable>
            </div>
          )}

          {dialogOption?.option == "changeTime" && slotToChange && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit {slotToChange.name} Slot</DialogTitle>
                <DialogDescription>
                  {format(slotToChange.date, "PPP")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start-time" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    type="time"
                    id="start-time"
                    className="col-span-3"
                    value={slotToChange.start || ""}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setSlotToChange({ ...slotToChange, start: newStart });
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end-time" className="text-right">
                    End Time
                  </Label>
                  <Input
                    type="time"
                    id="end-time"
                    className="col-span-3"
                    value={slotToChange.end || ""}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      if (
                        slotToChange.start &&
                        isTimeBeforeOrEqual(newEnd, slotToChange.start)
                      ) {
                        setToastMessage({
                          message: "End time must be after start time",
                          variant: "danger",
                        });
                        return;
                      }
                      setSlotToChange({ ...slotToChange, end: newEnd });
                    }}
                    disabled={!slotToChange.start}
                  />
                </div>
                {slotToChange.start && slotToChange.end && (
                  <div className="text-center text-sm text-muted-foreground">
                    Duration:{" "}
                    {calculateDuration(slotToChange.start, slotToChange.end)}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !slotToChange.name ||
                    !slotToChange.date ||
                    !slotToChange.start ||
                    !slotToChange.end ||
                    isChangingTime
                  }
                  onClick={() => {
                    if (slotToChange.end <= slotToChange.start) {
                      setToastMessage({
                        message: "End time must be after start time",
                        variant: "danger",
                      });
                      return;
                    }
                    changeExamTime();
                  }}
                >
                  {isChangingTime ? (
                    <Loader2 className="animate-spin h-2 w-2" />
                  ) : (
                    <Pencil className="h-2 w-2" />
                  )}
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          )}

          {dialogOption?.option == "conflict" && (
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] flex-col">
              {isReviewingConflict && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="p-4 border-2 border-primary rounded-lg bg-black/70">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                </div>
              )}

              <DialogHeader className="text-center space-y-3 pb-4 flex-shrink-0 p-2">
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
                  for the {backupSelectedSlotInfo?.slot?.name} slot on{" "}
                  {backupSelectedSlotInfo?.day
                    ? format(
                        new Date(backupSelectedSlotInfo.day),
                        "dd MMM yyyy"
                      )
                    : ""}
                </DialogTitle>
                <DialogDescription className="text-sm  text-center">
                  The following conflicts prevent this course from being
                  scheduled on the selected date and slot.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-6 px-1">
                {/* Conflicts Section */}
                <div className="space-y-3">
                  <h3 className="text-sm text-center px-1 mb-1">
                    Conflicts for the Entire Day{" "}
                    {suggesstedSlot && isAllowedToReview && (
                      <span className="font-bold">
                        {format(
                          new Date(suggesstedSlot?.date || new Date()),
                          "dd MMM yyyy"
                        )}
                      </span>
                    )}
                  </h3>
                  <ScrollArea className="max-h-[200px] rounded-md border">
                    <div className="p-4 space-y-2">
                      {conflictMessage && conflictMessage.length > 0 ? (
                        conflictMessage.map((conflictedGroup, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            onClick={() => {
                              setConflictedStudents(conflictedGroup[2]);
                              setConflictedCourses([
                                conflictedGroup[0].course.title +
                                  " " +
                                  conflictedGroup[0].group_name,
                                conflictedGroup[1].course.title +
                                  " " +
                                  conflictedGroup[1].group_name,
                              ]);
                              setShowConflicts(true);
                            }}
                            className="w-full cursor-pointer p-3 rounded-md flex justify-between items-center text-left font-medium hover:bg-gray-30 transition-colors"
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
                              {conflictedGroup[2].length}
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
                  <h3 className="text-sm  text-center px-1">
                    Best Suggested Slot
                  </h3>
                  <div className="rounded-md border">
                    <div className="p-4">
                      {bestSuggestion ? (
                        <Badge
                          variant="outline"
                          className="w-full p-4 rounded-md flex items-center justify-center  bg-primary text-white font-bold"
                        >
                          <span className="text-center">
                            <span className="font-semibold">
                              {suggesstedSlot?.slot}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {format(
                                new Date(suggesstedSlot?.date || new Date()),
                                "eee"
                              )}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {format(
                                new Date(suggesstedSlot?.date || new Date()),
                                "dd MMM yyyy"
                              )}
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
                    {suggestions && suggestions.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 cursor-pointer"
                        onClick={() => setViewAllSuggestions(true)}
                      >
                        {" "}
                        view all
                      </Badge>
                    )}
                  </h3>
                  <div className="rounded-md border">
                    <div className="p-4">
                      {suggestions && suggestions.length > 0 ? (
                        <div className="grid grid-cols-7 gap-1">
                          {suggestions.map(
                            (suggestion, idx) =>
                              suggestion.suggested && (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSuggesstedSlot(suggestion);
                                    setIsAllowedToReview(true);
                                  }}
                                  className={`p-2 text-center m-1 cursor-pointer  border rounded-md  font-bold ${
                                    suggestion.date === suggesstedSlot?.date &&
                                    suggestion.slot === suggesstedSlot?.slot
                                      ? "bg-primary text-white"
                                      : "hover:bg-yellow-100 hover:text-white"
                                  }`}
                                >
                                  <div className="text-xs font-medium">
                                    {format(new Date(suggestion.date), "EEE")}
                                  </div>
                                  <div className="text-sm">
                                    {format(new Date(suggestion.date), "d")}
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {suggestion.slot}
                                  </div>
                                </button>
                              )
                          )}
                        </div>
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

              <DialogFooter className="flex-shrink-0 mt-6 p-4 border-t bg-primary">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Would you like to proceed with scheduling this exam?
                    </p>
                    <p className="text-sm text-gray-400">
                      If you click "Yes", the exam will be scheduled in the best
                      suggested slot unless you choose a different one above.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={scheduleCourse}
                      className="px-6 py-2 font-medium"
                    >
                      Yes, Continue
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDraggedCourse(null);
                        setBackupDraggedCourse(null);
                        setBackupDraggedCourseGroup(null);
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
        </div>
        {viewAllSuggestions && suggestions && (
          <DialogContent className="sm:max-w-[800px]   border p-5">
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400">
                All Suggestions
              </h4>
            </div>

  
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow className="border-b    dark:hover:bg-gray-750">
                    <TableHead className=" font-semibold">Date</TableHead>
                    <TableHead className=" font-semibold">Slot</TableHead>
                    <TableHead className=" font-semibold">Suggested</TableHead>
                    <TableHead className=" font-semibold">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className=" ">
                          {searchTerm ? (
                            <>
                              <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                              <p>No students found matching "{searchTerm}"</p>
                              <p className="text-sm mt-1">
                                Try adjusting your search terms
                              </p>
                            </>
                          ) : (
                            <p>No conflicted students found</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suggestions?.map((suggestion, index) => (
                      <TableRow
                        key={index}
                        className={`
                      border-b   
                      
                      transition-colors duration-150
                 
                    `}
                      >
                        <TableCell className="font-medium  ">
                          {suggestion.date}
                        </TableCell>
                        <TableCell className=" ">{suggestion.slot}</TableCell>
                        <TableCell className=" ">
                          {suggestion.suggested ? "Suggested" : "Not Suggested"}
                        </TableCell>
                        <TableCell className="  ">
                          <Badge variant={"default"}>
                            {suggestion.reason || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
           
          </DialogContent>
        )}
      </Dialog>
      <ConflictDialog
        conflictedCourses={conflictedCOurses}
        conflictedStudents={conflictedStudents}
        onOpenChange={handleCloseConflicts}
        open={showConflicts}
      />
    </>
  );
}

export default ManualTimeTable;
