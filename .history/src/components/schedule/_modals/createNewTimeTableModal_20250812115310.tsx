"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";

import { useModal } from "../../../../providers/modal-context";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MultiSelect } from "../../../components/multi-select";

import {
  Exam,
  ExamSheduleFormData,
  examScheduleSchema,
} from "../../../../types/index";
import { Option } from "../../../components/ui/multiple-selector";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Loader,
  Loader2,
  Pencil,
  Plus,
  Printer,
  X,
} from "lucide-react";
import useUserAxios from "../../../hooks/useUserAxios";
import useToast from "../../../hooks/useToast";
import { isAxiosError } from "axios";
import useExamsSchedule from "../../../hooks/useExamShedule";
import { ExamsResponse } from "../../../Layouts/ExamsSchedulesLayout";
import { Event } from "../../../../types/index";
import { Card, CardContent, CardDescription, CardTitle } from "../../ui/card";
import { ScrollArea } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  department: Department;
  semester: Semester;
  description: string;
  instructor: string;
  student_enrolled: string;
}

interface WindowView {
  split: boolean;
  formOnly: boolean;
  slotsOnly: boolean;
}
interface SelectedSlot {
  date: string;
  id: string;
  name: string;
  start: string;
  end: string;
}
interface NewDay {
  date: string;
  slots: SelectedSlot[];
}
interface FormView {
  updateSlot: boolean;
  addSlot: boolean;
  addDay: boolean;
}
export default function CreateNewTimeTableModal() {
  const { setServerLoadingMessage, setToastMessage, serverLoadingMessage } =
    useToast();
  const axios = useUserAxios();
  const { setClose, data } = useModal();
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingCourses, startLoadingCoursesTransition] = useTransition();
  const [isGettingExamSlots, startGettingExamSlotTransitions] = useTransition();
  const [examSlots, setExamSlots] = useState<any | null>(null);
  const [windowView, setWindowView] = useState<WindowView>({
    formOnly: false,
    split: true,
    slotsOnly: false,
  });
  const [formView, setFormView] = useState<FormView>({
    addDay: false,
    addSlot: false,
    updateSlot: false,
  });
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [newSlot, setNewSlot] = useState<SelectedSlot>({
    date: "",
    end: "",
    start: "",
    id: "",
    name: "",
  });
  const [newDay, setNewDay] = useState<NewDay>({
    date: "",
    slots: [],
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [wantedSlots, setWantedSlots] = useState<number>(0);
  const {
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamSheduleFormData>({
    resolver: zodResolver(examScheduleSchema),
    defaultValues: {
      start_date: "",
      end_date: "",
      course_ids: [],
    },
  });

  const getExamsSlots: SubmitHandler<ExamSheduleFormData> = (formData) => {
    if (!date || !endDate) {
      setToastMessage({
        message: "Please choose start and enddate",
        variant: "danger",
      });
      return;
    }
    startGettingExamSlotTransitions(async () => {
      try {
        const resp = await axios.post("/api/schedules/generate_slots/", {
          start_date: date,
          end_date: endDate,
        });
        if (resp.data.success) {
          const formatted: any = Object.fromEntries(
            Object.entries(resp.data.data).map(([date, sessions]: any) => [
              date,
              sessions.map(([id, name, start, end]: any) => ({
                id,
                name,
                start: start.slice(0, 5),
                end: end.slice(0, 5),
              })),
            ])
          );
          setExamSlots(formatted);
          setWindowView({ formOnly: false, slotsOnly: true, split: false });
        }
      } catch (error) {
        if (isAxiosError(error)) {
          setToastMessage({
            message: error.message,
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      }
    });
  };
  const fetchCourses = () => {
    startLoadingCoursesTransition(async () => {
      try {
        const response = await axios.get("/api/courses/");
        const { data } = response.data;

        const formattedOptions: Option[] = (data as Course[]).map(
          (course: Course) => ({
            label: `${course.code} - ${course.title} -${course.semester.name}`,
            value: course.id,
          })
        );

        setCourseOptions(formattedOptions);
        setSelectedCourses(formattedOptions.map((option) => option.value));
      } catch (error) {
        if (isAxiosError(error)) {
          setToastMessage({
            message: "Error while trying to get courses",
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      }
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

  const handleSave = () => {
    if (selectedSlot) {
      setExamSlots((prev: any) => ({
        ...prev,
        [selectedSlot.date]: prev[selectedSlot.date].map((slot: any) =>
          slot.id === selectedSlot.id
            ? { ...slot, start: selectedSlot.start, end: selectedSlot.end }
            : slot
        ),
      }));
      setSelectedSlot(null);
      setDialogOpen(false);
      setFormView({
        addDay: false,
        addSlot: false,
        updateSlot: false,
      });
    }
  };

  const getTime = (date: string, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const inputDateTime = new Date(date);
    inputDateTime.setHours(hours, minutes, 0, 0);
    return inputDateTime;
  };

  const addSlotToDate = (
    date: string,
    newSlot: { name: string; start: string; end: string }
  ) => {
    const dayOfWeek = new Date(date).getDay();

    if (dayOfWeek === 6) {
      alert("Cannot add slots on Saturday");
      return false;
    }

    if (dayOfWeek === 5) {
      const [hours] = newSlot.end.split(":").map(Number);
      if (hours >= 17) {
        setToastMessage({
          message: "Friday slots cannot extend beyond 5:00 PM",
          variant: "danger",
        });
        return false;
      }
    }

    if (getTime(date, newSlot.end) <= getTime(date, newSlot.start)) {
      setToastMessage({
        message: "End time must be after start time",
        variant: "danger",
      });
      return false;
    }

    setExamSlots((prev: any) => ({
      ...prev,
      [date]: [
        ...(prev[date] || []),
        {
          ...newSlot,
          id: Date.now().toString(),
        },
      ],
    }));
    setSelectedSlot(null);
    setNewSlot({
      date: "",
      end: "",
      start: "",
      id: "",
      name: "",
    });
    setDialogOpen(false);
    setFormView({
      addDay: false,
      addSlot: false,
      updateSlot: false,
    });
    return true;
  };
  const addNewDay = (
    date: string,
    slots: Array<{ name: string; start: string; end: string }>
  ) => {
    const dayOfWeek = new Date(date).getDay();

    if (dayOfWeek === 6) {
      setToastMessage({
        message: "Cannot add Saturday as a day",
        variant: "danger",
      });
      return false;
    }

    for (const slot of slots) {
      if (dayOfWeek === 5) {
        const [hours] = slot.end.split(":").map(Number);
        if (hours >= 17) {
          setToastMessage({
            message: `Friday slot "${slot.name}" cannot extend beyond 5:00 PM`,
            variant: "danger",
          });
          return false;
        }
      }

      if (slot.end <= slot.start) {
        setToastMessage({
          message: `Slot "${slot.name}" has invalid time range`,
          variant: "danger",
        });
        return false;
      }
    }

    setExamSlots((prev: any) => ({
      ...prev,
      [date]: slots.map((slot) => ({
        ...slot,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })),
    }));
    setNewDay({
      date: "",
      slots: [],
    });
    setSelectedSlot(null);
    setDialogOpen(false);
    setFormView({
      addDay: false,
      addSlot: false,
      updateSlot: false,
    });
    return true;
  };

  const deleteSlot = (date: string, slotId: string) => {
    if (window.confirm("Are you sure you want to delete this time slot?")) {
      setExamSlots((prev: any) => {
        const updatedSlots = { ...prev };

        updatedSlots[date] = prev[date].filter(
          (slot: any) => slot.id !== slotId
        );

        if (updatedSlots[date].length === 0) {
          delete updatedSlots[date];
        }

        return updatedSlots;
      });
    }
  };

  const deleteDay = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    if (
      window.confirm(`Are you sure you want to delete all slots for ${date}?`)
    ) {
      setExamSlots((prev: any) => {
        const updatedSlots = { ...prev };
        delete updatedSlots[date];
        return updatedSlots;
      });
      return true;
    }
    return false;
  };

  // const onSubmit: SubmitHandler<ExamSheduleFormData> = async (formData) => {
  //   setServerLoadingMessage({
  //     message: `Generating timetable`,
  //     isServerLoading: true,
  //   });
  //   setClose();
  //   startTransition(async () => {
  //     try {
  //       const payload = {
  //         start_date: formData.start_date,
  //         end_date: formData.end_date,
  //         course_ids: formData.course_ids,
  //         // semester: formData.semester,
  //       };

  //       const resp = await axios.post(
  //         "/api/exams/exams/generate-exam-schedule/",
  //         payload
  //       );

  //       const { data } = resp;

  //       if (data.success) {
  //         setToastMessage({
  //           message: data.message,
  //           variant: "success",
  //         });
  //         const respTyped = resp as { data: ExamsResponse };
  //         const datas: Event[] = respTyped.data.data.map((ex: any) => {
  //           const startDate = new Date(`${ex.date}T${ex.start_time}`);
  //           const endDate = new Date(`${ex.date}T${ex.end_time}`);
  //           let examEvent: Event = {
  //             title: ex.group.course.title,
  //             description: ex.status,
  //             id: String(ex.id),
  //             startDate: startDate,
  //             endDate: endDate,
  //           };
  //           return examEvent;
  //         });

  //         setExams(datas);
  //         if (resp.data.unscheduled) {
  //           let unschedules = resp.data.unscheduled;

  //           setUnScheduled(unschedules);
  //         }
  //       } else {
  //         setMessage("Something went wrong.");
  //       }
  //     } catch (error) {
  //       if (isAxiosError(error)) {
  //         const message = error.response?.data?.message;
  //         setToastMessage({
  //           message: message,
  //           variant: "danger",
  //         });
  //       } else {
  //         setToastMessage({
  //           message: "Something went wrong",
  //           variant: "danger",
  //         });
  //         console.log(error);
  //       }
  //     } finally {
  //       setServerLoadingMessage({ isServerLoading: false });
  //     }
  //   });
  // };

  useEffect(() => {
    if (date) {
      setValue("start_date", date.toISOString());
    }
    if (endDate) {
      setValue("end_date", endDate.toISOString());
    }
  }, [endDate, date, setValue]);

  useEffect(() => {
    if (selectedCourses.length > 0) {
      setValue(
        "course_ids",
        selectedCourses.map(Number) as [number, ...number[]]
      );
    }
  }, [selectedCourses]);

  useEffect(() => {
    if (data?.default) {
      const examData = data.default;
      reset({
        start_date: examData.start_date,
        course_ids: examData.course_ids,
      });
      if (examData.start_date) {
        setDate(new Date(examData.start_date));
      }
    }
  }, [data, reset]);

  useEffect(() => {
    fetchCourses();
  }, []);

  console.log(newDay)

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        setSelectedSlot(null);
        setNewSlot({
          date: "",
          end: "",
          start: "",
          id: "",
          name: "",
        });
        setNewDay({
          date: "",
          slots: [],
        });
        setFormView({
          addDay: false,
          addSlot: false,
          updateSlot: false,
        });
        setDialogOpen(false);
      }}
    >
      <div className="flex flex-col items-center justify-start">
        <div className="relative flex items-center justify-between w-full px-4 py-2 mb-4 gap-4">
          {/* Empty div to balance the layout - takes same space as Generate button */}
          <div className="w-[110px]"></div>

          {/* Centered Button Group */}
          <div className="flex gap-1 items-center border rounded-md p-1 shadow-sm">
            <Button
              variant={windowView.formOnly ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                setWindowView({
                  formOnly: true,
                  split: false,
                  slotsOnly: false,
                })
              }
            >
              Form Only
            </Button>
            <Button
              variant={windowView.split ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                setWindowView({
                  formOnly: false,
                  split: true,
                  slotsOnly: false,
                })
              }
            >
              Split
            </Button>
            <Button
              variant={windowView.slotsOnly ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                setWindowView({
                  formOnly: false,
                  split: false,
                  slotsOnly: true,
                })
              }
            >
              Slots Only
            </Button>
          </div>

          <Button size="sm" className="flex items-center gap-1 min-w-[110px]">
            <Printer className="h-4 w-4" />
            Generate
          </Button>
        </div>
        <div
          className={`grid ${
            windowView.split ? "grid-cols-2 w-full" : "grid-cols-1 w-full"
          }`}
        >
          {(windowView.split || windowView.formOnly) && (
            <form
              className={`flex flex-col gap-4 p-2 pt-0 ${
                windowView.formOnly
                  ? "w-full max-w-[1200px]"
                  : "sm:max-w-[800px]"
              } max-h-[100vh] overflow-y-auto`}
              onSubmit={handleSubmit(getExamsSlots)}
            >
              <div className="text-center py-2 px-3 text-2xl font-bold">
                Create New Exam Schedule
              </div>
              {isLoadingCourses || selectedCourses.length <= 0 ? (
                <div className="flex justify-center">
                  <Loader className="animate-spin" />
                </div>
              ) : (
                <>
                  <Label htmlFor="start_date">Courses</Label>
                  <MultiSelect
                    options={courseOptions}
                    onValueChange={setSelectedCourses}
                    defaultValue={selectedCourses}
                    value={String(watch("course_ids"))}
                    placeholder="Select Courses"
                    variant="inverted"
                    animation={2}
                    maxCount={5}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">
                      {errors.course_ids?.message}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start_date" className="p-4">
                        Start Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                            id="date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            captionLayout="dropdown"
                            hidden={{ before: new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.start_date && (
                        <p className="text-sm text-red-500">
                          {errors.start_date.message as string}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <Label htmlFor="end_date" className="p-4">
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                            id="end_date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? (
                              format(endDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            captionLayout="dropdown"
                            hidden={{ before: date || new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.end_date && (
                        <p className="text-sm text-red-500">
                          {errors.end_date.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isGettingExamSlots}>
                    {isGettingExamSlots ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Get Slots"
                    )}
                  </Button>

                  {message && (
                    <p
                      className={`text-sm ${
                        message.includes("Error")
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </>
              )}
            </form>
          )}
          {(windowView.split || windowView.slotsOnly) && (
            <div className={`${windowView.slotsOnly ? "w-full" : ""}`}>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex-1 text-center">
                  <h2 className="text-2xl font-bold">Examination Slots</h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 p-2 flex items-center gap- font-bold"
                  onClick={() => {
                    setFormView({
                      addDay: true,
                      addSlot: false,
                      updateSlot: false,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  <span>New Day</span>
                </Button>
              </div>
              {examSlots ? (
                <div
                  className={`grid ${
                    windowView.slotsOnly
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  } gap-4 max-h-[70vh] overflow-y-auto p-2`}
                >
                  {Object.keys(examSlots).map((date: string, index) => {
                    const slots = examSlots[date];
                    return (
                      <Card key={index} className="min-w-0">
                        <div className="text-center py-4 px-3 border-b sticky top-0 z-10">
                          <CardTitle>
                            <h2 className="text-lg font-bold">
                              {format(date, "eee")}
                            </h2>
                          </CardTitle>
                          <CardDescription>
                            <p className="text-sm mt-1">
                              {format(date, "dd MMM yyyy")}
                            </p>
                          </CardDescription>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-6 w-6 p-1 absolute top-1 left-1"
                            onClick={() => {
                              setSelectedSlot({
                                name: "",
                                date: date,
                                id: "",
                                start: "",
                                end: "",
                              });
                              setFormView({
                                addDay: false,
                                addSlot: true,
                                updateSlot: false,
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-1 absolute top-1 right-1"
                            onClick={() => deleteDay(date)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <CardContent className="p-2 sm:p-3 flex flex-col gap-2">
                          {examSlots[date].map((slot: any, idx: number) => (
                            <Badge
                              key={idx}
                              className="w-full px-2 py-1 flex items-center justify-between gap-2"
                            >
                              <span className="truncate flex-1 text-xs sm:text-sm">
                                {slot.name}
                              </span>
                              <span className="text-xs whitespace-nowrap">
                                {slot.start}-{slot.end}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-1"
                                  onClick={() => {
                                    setSelectedSlot({
                                      name: slot.name,
                                      date: date,
                                      id: slot.id,
                                      start: slot.start,
                                      end: slot.end,
                                    });
                                    setFormView({
                                      addDay: false,
                                      addSlot: false,
                                      updateSlot: true,
                                    });
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-1"
                                  onClick={() => {
                                    deleteSlot(date, slot.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </Badge>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 px-3">
                  No Dates selected yet! select start and end date and then
                  generate slots
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {formView.updateSlot && selectedSlot && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {selectedSlot.name} Slot</DialogTitle>
            <DialogDescription>
              {format(selectedSlot.date, "PPP")}
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
                value={selectedSlot.start || ""}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setSelectedSlot({ ...selectedSlot, start: newStart });
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
                value={selectedSlot.end || ""}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  if (
                    selectedSlot.start &&
                    isTimeBeforeOrEqual(newEnd, selectedSlot.start)
                  ) {
                    setToastMessage({
                      message: "End time must be after start time",
                      variant: "danger",
                    });
                    return;
                  }
                  setSelectedSlot({ ...selectedSlot, end: newEnd });
                }}
                disabled={!selectedSlot.start}
              />
            </div>
            {selectedSlot.start && selectedSlot.end && (
              <div className="text-center text-sm text-muted-foreground">
                Duration:{" "}
                {calculateDuration(selectedSlot.start, selectedSlot.end)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !selectedSlot.name || !selectedSlot.start || !selectedSlot.end
              }
              onClick={() => {
                if (selectedSlot.end <= selectedSlot.start) {
                  setToastMessage({
                    message: "End time must be after start time",
                    variant: "danger",
                  });
                  return;
                }
                handleSave();
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {formView.addSlot && selectedSlot && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Slot</DialogTitle>
            <DialogDescription>
              {format(selectedSlot.date, "PPP")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slot_name" className="text-right">
                Name
              </Label>
              <Input
                type="text"
                id="slot_name"
                className="col-span-3"
                value={newSlot?.name || ""}
                onChange={(e) => {
                  const newName = e.target.value;
                  setNewSlot({ ...newSlot, name: newName });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">
                Start Time
              </Label>
              <Input
                type="time"
                id="start-time"
                className="col-span-3"
                value={newSlot?.start || new Date().getTime()}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setNewSlot({ ...newSlot, start: newStart });
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
                value={newSlot.end || ""}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  if (
                    selectedSlot.start &&
                    isTimeBeforeOrEqual(newEnd, newSlot.start)
                  ) {
                    setToastMessage({
                      message: "End time must be after start time",
                      variant: "danger",
                    });
                    return;
                  }
                  setNewSlot({ ...newSlot, end: newEnd });
                }}
                disabled={!newSlot.start}
              />
            </div>
            {selectedSlot.start && selectedSlot.end && (
              <div className="text-center text-sm text-muted-foreground">
                Duration:{" "}
                {calculateDuration(selectedSlot.start, selectedSlot.end)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!newSlot.name || !newSlot.start || !newSlot.end}
              onClick={() => {
                if (newSlot.end <= newSlot.start) {
                  setToastMessage({
                    message: "End time must be after start time",
                    variant: "danger",
                  });
                  return;
                }
                addSlotToDate(selectedSlot.date, {
                  name: newSlot.name,
                  end: newSlot.end,
                  start: newSlot.start,
                });
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {formView.addDay && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Day</DialogTitle>
            <DialogDescription>
              Add new Day to the generated slots.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      "text-muted-foreground"
                    )}
                    id="newDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                        {newDay.date.length>0 ? (
                              format(new Date(newDay.date), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selected) => {
                      if (selected) {
                        setNewDay({
                          ...newDay,
                          date: selected.toString().split("T")[0],
                        });
                      }
                    }}
                    captionLayout="dropdown"
                    hidden={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col">
              {new Array(wantedSlots).map((i) => {
                return (
                  <div key={i}>
                    <Button
                      variant={"ghost"}
                      className="sm"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this time slot?"
                          )
                        ) {
                          setNewDay((prev: NewDay) => ({
                            ...prev,
                            slots: prev.slots.filter(
                              (slot: any) => slot.id !== i
                            ),
                          }));
                        }
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slot_name" className="text-right">
                        Name
                      </Label>
                      <Input
                        type="text"
                        id="slot_name"
                        className="col-span-3"
                        value={newSlot?.name || ""}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setNewDay((prev: NewDay) => ({
                            ...prev,
                            slots: prev.slots.map((slot: any) =>
                              slot.id == i ? { ...slot, name: newName } : slot
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start-time" className="text-right">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        id="start-time"
                        className="col-span-3"
                        value={newSlot?.start || ""}
                        onChange={(e) => {
                          const start = e.target.value;
                          setNewDay({ ...newDay, slots: [...newDay.slots] });
                          setNewDay((prev: NewDay) => ({
                            ...prev,
                            slots: prev.slots.map((slot: any) =>
                              slot.id == i ? { ...slot, start: start } : slot
                            ),
                          }));
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
                        value={newSlot.end || ""}
                        onChange={(e) => {
                          const end = e.target.value;
                          setNewDay({ ...newDay, slots: [...newDay.slots] });
                          setNewDay((prev: NewDay) => ({
                            ...prev,
                            slots: prev.slots.map((slot: any) =>
                              slot.id == i ? { ...slot, name: end } : slot
                            ),
                          }));
                        }}
                        disabled={!newDay.slots[i]}
                      />
                    </div>
                    {newDay.slots[i].start && newDay.slots[i].end && (
                      <div className="text-center text-sm text-muted-foreground">
                        Duration:{" "}
                        {calculateDuration(
                          newDay.slots[i].start,
                          newDay.slots[i].end
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between">
                <div></div>
                <Button
                  variant={"ghost"}
                  className="sm"
                  onClick={() => {
                    setWantedSlots((prev) => prev + 1);
                    setNewDay((prev: NewDay) => ({
                      ...prev,
                      slots: [
                        ...prev.slots,
                        {
                          name: "",
                          date: "",
                          end: "",
                          id: String(wantedSlots),
                          start: "",
                        },
                      ],
                    }));
                  }}
                >
                  <Plus className="h-2 w-2" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!newSlot.name || !newSlot.start || !newSlot.end}
              onClick={() => {
                if (newSlot.end <= newSlot.start) {
                  setToastMessage({
                    message: "End time must be after start time",
                    variant: "danger",
                  });
                  return;
                }
                addNewDay(newDay.date, newDay.slots);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
