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
import { CalendarIcon, Loader, Loader2 } from "lucide-react";
import useUserAxios from "../../../hooks/useUserAxios";
import useToast from "../../../hooks/useToast";
import { isAxiosError } from "axios";
import useExamsSchedule from "../../../hooks/useExamShedule";
import { ExamsResponse } from "../../../Layouts/ExamsSchedulesLayout";
import { Event } from "../../../../types/index";
import { Card, CardContent, CardTitle } from "../../ui/card";

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
  const [isPending, startTransition] = useTransition();
  const [isLoadingCourses, startLoadingCoursesTransition] = useTransition();
  const [isGettingExamSlots, startGettingExamSlotTransitions] = useTransition();
  const { setExams, setUnScheduled } = useExamsSchedule();
  const [examSlots, setExamSlots] = useState<any | null>(null);
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
          setExamSlots(resp.data.data);
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

  return (
    <div className={`grid grid-cols-2`}>
      <form
        className={`flex flex-col gap-4 p-4 sm:max-w-[800px] max-h-[100vh] overflow-y-auto`}
        onSubmit={handleSubmit(getExamsSlots)}
      >
        {isLoadingCourses || selectedCourses.length <= 0 ? (
          <p>Loading ...</p>
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
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                  message.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
          </>
        )}
      </form>

      <div className="">
          <div className="text-center py-4 px-3 text-2xl font-bold">Examination Slots</div>
        {examSlots && (
          <div>
            {Object.keys(examSlots).map((date: string, index) => {
              const slots = examSlots[date];
              return (
                <Card key={index}>
                  <div className="text-center py-4 px-3   border-b sticky top-0 z-10">
                    <h2 className="text-lg font-bold">{format(date, "eee")}</h2>
                    <p className="text-sm mt-1">
                      {format(date, "dd MMM yyyy")}
                    </p>
                  </div>
                  <CardContent></CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
