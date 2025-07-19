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
import   {
  Option,
} from "../../../components/ui/multiple-selector";
import { format } from "date-fns";
import { CalendarIcon, Loader, Loader2 } from "lucide-react";
import useUserAxios from "../../../hooks/useUserAxios";
import useToast from "../../../hooks/useToast";
import { isAxiosError } from "axios";
import useExamsSchedule from "../../../hooks/useExamShedule";
import { ExamsResponse } from "../../../Layouts/ExamsSchedulesLayout";
import { Event } from "../../../../types/index";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../../ui/dialog";
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
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const[isLoadingCourses, startLoadingCoursesTransition]= useTransition()
  const { setExams } = useExamsSchedule();
  const[unscheduledExams, setUnscheduledExams]= useState<Unscheduled[] | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(true);

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
      setSelectedCourses(formattedOptions.map(option => option.value))
      
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
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamSheduleFormData>({
    resolver: zodResolver(examScheduleSchema),
    defaultValues: {
      start_date: "",
      end_date:"",
      course_ids: [],
    },
  });

  useEffect(() => {
    if (date) {
      setValue("start_date", date.toISOString());
    }
    if(endDate){
       setValue("end_date", endDate.toISOString());

    }
  }, [endDate,date, setValue]);

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

  const onSubmit: SubmitHandler<ExamSheduleFormData> = async (formData) => {
    startTransition(async () => {
      try {
        const payload = {
          start_date: formData.start_date,
          end_date: formData.end_date,
          course_ids: formData.course_ids,
          // semester: formData.semester,
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
              title: ex.group.course.title,
              description: ex.status,
              id: String(ex.id),
              startDate: startDate,
              endDate: endDate,
            };
            return examEvent;
          });

          setExams(datas);
          if( resp.data.data.unscheduled){
            setUnscheduledExams(resp.data.data.unscheduled)
            setDialogOpen(true)

          }
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
          console.log(error)
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

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
        value={String(watch("course_ids"))}
        placeholder="Select Courses"
        variant="inverted"
        animation={2}
        maxCount={5}
        
      />
       {errors.start_date && (
        <p className="text-sm text-red-500">
          {errors.course_ids?.message}
        </p>)}
      <div className="grid grid-cols-2 gap-2">
        <div >
          <Label htmlFor="start_date" className="p-4">Start Date</Label>
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
        <Label htmlFor="end_date" className="p-4">End Date</Label>
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
            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
             captionLayout="dropdown"
        
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
    <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
            <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
               

              <DialogTitle className="text-l font-bold  leading-tight">
                UnScheduled Exams
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed  text-center">
                Use your phone's camera to scan this QR code and instantly access complete exam information and resources.
              </DialogDescription>
            </DialogHeader>

            {unscheduledExams && (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    

                  <div className="relative">
                    <ol>
                     {unscheduledExams.map((exam, idx)=>{
                      return <li key={idx}>{exam.courseId} 
                      <ol>
                        {exam.groups.map((g, id)=>{
                        return <li key={id}> {g}</li>
                      })}
                      </ol>
                      </li>
                     })}
                     </ol>
                  </div>
                </div>

               
              </div>
            )}


          </DialogContent>
    </Dialog>
  );
}
