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
import {
  Exam,
  ExamSheduleFormData,
  examScheduleSchema,
  Variant,
  ExamResheduleFormData,
  examRescheduleSchema,
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

 

export default function  RescheduleExamModal({exam}: { exam: Event }) {
  const { setToastMessage } = useToast();
  const axios = useUserAxios();
  const { setClose, data } = useModal();
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setExams } = useExamsSchedule();

 

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamResheduleFormData>({
    resolver: zodResolver(examRescheduleSchema),
    defaultValues: {
      new_date: "",
      exam_id: exam.id || "",
      slot:"Morning"
    },
  });

  useEffect(() => {
     if (newDate) {
    setValue("new_date", format(newDate, "yyyy-MM-dd"));  
  }
  }, [newDate, setValue]);

  useEffect(() => {
    if (data?.default) {
      const examData = data.default;
     reset({
  new_date:  exam.startDate ? format(exam.startDate, "yyyy-MM-dd") : "",
  exam_id: exam.id || "",
});
      if (exam.startDate) {
        setNewDate(new Date(exam.startDate));
      }
    }
  }, [data, reset]);
  const onSubmit: SubmitHandler<ExamResheduleFormData> = async (formData) => {
    startTransition(async () => {
      try {
        const payload = {
          new_date: formData.new_date,
            exam_id: formData.exam_id,
            slot: formData.slot
        };

        const resp = await axios.post(
          "/api/exams/exams/reschedule-exam/",
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

 

  return (
    <form
      className="flex flex-col gap-4 p-4 sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Label htmlFor="start_date">Start Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !newDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {newDate? newDate.toDateString():<span>Pick a new  date for this exam</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={newDate}
            onSelect={setNewDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {errors.new_date && (
        <p className="text-sm text-red-500">
          {errors.new_date.message as string}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="semester">Slot</Label>
        <Select
          onValueChange={(value) => setValue("slot",value)}
          value={String(watch("slot"))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Slot" />
          </SelectTrigger>
          <SelectContent>
            {["Morning","Afternoon", "Evening"].map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.slot && (
          <p className="text-sm text-red-500">
            {errors.slot.message as string}
          </p>
        )}
      </div>

      

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : "Reschedule Exam"}
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
    </form>
  );
}
