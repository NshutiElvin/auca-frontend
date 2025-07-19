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
  Variant,
} from "../../../../types/index";
import { useScheduler } from "../../../../providers/schedular-provider";
import { v4 as uuidv4 } from "uuid";
import MultipleSelector, {
  Option,
} from "../../../components/ui/multiple-selector";
import { format } from "date-fns";
import { CalendarIcon, Loader, Loader2 } from "lucide-react";
import useUserAxios from "../../../hooks/useUserAxios";
import useToast from "../../../hooks/useToast";
import { isAxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import useExamsSchedule from "../../../hooks/useExamShedule";
import { ExamsResponse } from "../../../Layouts/ExamsSchedulesLayout";
import { Event } from "../../../../types/index";
interface  Department{
  id:string;
  code:string;
  name:string;
}

interface  Semester{
  id:string;
  name:string;
  start_date:string;
  end_date:string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  department:Department;
  semester:Semester;
  description:string;
  instructor:string;
  student_enrolled:string;

}

export default function CreateNewTimeTableModal() {
  const { setToastMessage } = useToast();
  const axios = useUserAxios();
  const { setClose, data } = useModal();
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const[selectedCourses, setSelectedCourses]= useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const[isLoadingCourses, startLoadingCoursesTransition]= useTransition()
  const { setExams } = useExamsSchedule();

  const fetchCourses = () => {
   startLoadingCoursesTransition(async()=>{
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
   })
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamSheduleFormData>({
    resolver: zodResolver(examScheduleSchema),
    defaultValues: {
      start_date: "",
      semester: 1,
      course_ids: [],
    },
  });

  useEffect(() => {
    if (date) {
      setValue("start_date", date.toISOString());
    }
  }, [date, setValue]);

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
  const onSubmit: SubmitHandler<ExamSheduleFormData> = async (formData) => {
    startTransition(async () => {
      try {
        const payload = {
          start_date: formData.start_date,
          course_ids: formData.course_ids,
          semester: formData.semester,
        };

        const resp = await axios.post(
          "/api/exams/exams/generate-exam-schedule/",
          payload
        );

        const { data } = resp;

        if (data.success) {
          setToastMessage({
            message: data.message,
            variant: "success",
          });
          const respTyped = resp as { data: ExamsResponse };
          const datas: Event[] = respTyped.data.data.map((ex: any) => {
            const startDate = new Date(`${ex.date}T${ex.start_time}`);
            const endDate = new Date(`${ex.date}T${ex.end_time}`);
            let examEvent: Event = {
              title: ex.course.title,
              description: ex.status,
              id: String(ex.id),
              startDate: startDate,
              endDate: endDate,
            };
            return examEvent;
          });

          setExams(datas);
        } else {
          setMessage("Something went wrong.");
        }
      } catch (error) {
        if (isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage({
            message: message,
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      } finally {
        setClose();
      }
    });
  };

  useEffect(() => {
    fetchCourses();
  }, []);


  return (
    <form
      className="flex flex-col gap-4 p-4 sm:max-w-[800px] max-h-[100vh] overflow-y-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
   {
    isLoadingCourses?<p>Loading ...</p>:<>  
    <Label htmlFor="start_date">Courses</Label>  
        
        <MultiSelect
        options={courseOptions}
        onValueChange={setSelectedCourses}
        defaultValue={selectedCourses}
        placeholder="Select Courses"
        variant="inverted"
        animation={2}
        maxCount={3}
      />
      <Label htmlFor="start_date">Start Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
        
          />
        </PopoverContent>
      </Popover>
      {errors.start_date && (
        <p className="text-sm text-red-500">
          {errors.start_date.message as string}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="semester">Semester</Label>
        <Select
          onValueChange={(value) => setValue("semester", Number(value))}
          value={String(watch("semester"))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(0)}>All Semester</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7].map((sem) => (
              <SelectItem key={sem} value={String(sem)}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.semester && (
          <p className="text-sm text-red-500">
            {errors.semester.message as string}
          </p>
        )}
      </div>

       

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : "Create Schedule"}
      </Button>

      {message && (
        <p
          className={`text-sm ${
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}</> 
   }
    </form>
  );
}
