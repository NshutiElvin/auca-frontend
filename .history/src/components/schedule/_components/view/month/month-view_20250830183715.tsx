"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { Badge } from "../../../../ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

import { useScheduler } from "../../../../../../providers/schedular-provider";
import { useModal } from "../../../../../../providers/modal-context";
import AddEventModal from "../../../../../components/schedule/_modals/add-event-modal";
import ShowMoreEventsModal from "../../../../..//components/schedule/_modals/show-more-events-modal";
import EventStyled from "../event-component/event-styled";
import { Event, CustomEventModal } from "../../../../../../types";
import CustomModal from "../../../../ui/custom-modal";

interface DayObj {
  day: number;
}

interface MonthViewProps {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}

interface MonthViewGetters {
  getDaysInMonth: (month: number, year: number) => DayObj[];
  getEventsForDay: (day: number, date: Date) => Event[];
}

interface MonthViewContext {
  getters: MonthViewGetters;
  weekStartsOn: "monday" | "sunday";
}

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

export default function MonthView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const { getters, weekStartsOn } = useScheduler();
  const { setOpen } = useModal();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState<number>(0);

  const daysInMonth = getters.getDaysInMonth(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );

  // Find the first day with an event in the current month
  const firstEventDay = useMemo(() => {
    for (let i = 0; i < daysInMonth.length; i++) {
      const dayEvents = getters.getEventsForDay(daysInMonth[i].day, currentDate);
      if (dayEvents.length > 0) {
        return daysInMonth[i].day;
      }
    }
    return 1; // fallback to day 1 if no events found
  }, [daysInMonth, getters, currentDate]);

  // Filter days to show only from the first event day onwards
  const filteredDaysInMonth = useMemo(() => {
    return daysInMonth.filter(dayObj => dayObj.day >= firstEventDay);
  }, [daysInMonth, firstEventDay]);

  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newDate);
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newDate);
  }, [currentDate]);

  function handleAddEvent(selectedDay: number) {
    // Create start date at 12:00 AM on the selected day
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay,
      0,
      0,
      0
    );

    // Create end date at 11:59 PM on the same day
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay,
      23,
      59,
      59
    );

    setOpen(
      <CustomModal title="Add Event">
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          startDate,
          endDate,
          title: "",
          id: "",
          variant: "primary",
        };
      }
    );
  }

  function handleShowMoreEvents(dayEvents: Event[]) {
    setOpen(
      <CustomModal title={dayEvents && dayEvents[0]?.startDate.toDateString()}>
        <ShowMoreEventsModal />
      </CustomModal>,
      async () => {
        return {
          dayEvents,
        };
      }
    );
  }

  const containerVariants = {
    enter: { opacity: 0 },
    center: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const daysOfWeek =
    weekStartsOn === "monday"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate the day of week for the first event day
  const firstEventDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    firstEventDay
  );
  const startDayOfWeek = firstEventDate.getDay();
  const adjustedStartDay = weekStartsOn === "monday" 
    ? (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1)
    : startDayOfWeek;

  // Calculate how many days to show per row (remaining days in first week + full weeks)
  const daysInFirstWeek = 7 - adjustedStartDay;
  const remainingDays = filteredDaysInMonth.length - daysInFirstWeek;
  const additionalRows = Math.ceil(remainingDays / 7);
  const totalCols = Math.min(filteredDaysInMonth.length, 7);

  return (
    <div>
      <div className="flex flex-col">
        <motion.h2
          key={currentDate.getMonth()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl  tracking-tighter font-bold"
        >
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}   
       
        </motion.h2>
        <div className="flex gap-3">
          {prevButton ? (
            <div onClick={handlePrevMonth}>{prevButton}</div>
          ) : (
            <Button
              variant="outline"
              className={classNames?.prev}
              onClick={handlePrevMonth}
            >
              <ArrowLeft />
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextMonth}>{nextButton}</div>
          ) : (
            <Button
              variant="outline"
              className={classNames?.next}
              onClick={handleNextMonth}
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
      
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${firstEventDay}`}
          custom={direction}
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
          className="grid grid-cols-7 gap-1 sm:gap-2 ml-4  "
        >
          {/* Show day headers only for the days that will be displayed */}
          {Array.from({ length: adjustedStartDay }).map((_, idx) => (
            <div key={`header-empty-${idx}`}  >
              {/* Empty header cell for alignment */}
            </div>
          ))}
          {filteredDaysInMonth.slice(0, 7 - adjustedStartDay).map((dayObj, idx) => {
            const dayIndex = (adjustedStartDay + idx) % 7;
            return (
              <div
                key={`header-${dayObj.day}`}
                 
              >
                {daysOfWeek[dayIndex]}
              </div>
            );
          })}
          {/* Show remaining headers for subsequent weeks if needed */}
          {filteredDaysInMonth.length > (7 - adjustedStartDay) && 
            Array.from({ length: Math.min(7, filteredDaysInMonth.length - (7 - adjustedStartDay)) }).map((_, idx) => {
              const dayIndex = idx % 7;
              const shouldShow = Math.floor((filteredDaysInMonth.length - (7 - adjustedStartDay)) / 7) > 0 || 
                               (filteredDaysInMonth.length - (7 - adjustedStartDay)) % 7 > idx;
              return shouldShow ? (
                <div
                  key={`header-week2-${idx}`}
                  className="text-left my-2 text-2xl tracking-tighter font-medium"
                >
                  {/* {daysOfWeek[dayIndex]} */}
                </div>
              ) : (
                <div key={`header-empty-week2-${idx}`} className="h-[1px]"></div>
              );
            })
          }

          {/* Add empty cells for proper alignment in first week */}
          {Array.from({ length: adjustedStartDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-[1px]">
              {/* Empty cell for alignment */}
            </div>
          ))}

          {/* Render filtered days (starting from first event day) */}
          {filteredDaysInMonth.map((dayObj: DayObj) => {
            const dayEvents = getters.getEventsForDay(dayObj.day, currentDate);

            return (
              <motion.div
                className="hover:z-50 border-none h-[100px] rounded group flex flex-col "
                key={dayObj.day}
                variants={itemVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card
                  className="shadow-md cursor-pointer overflow-hidden relative flex p-4 border h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMoreEvents(dayEvents);
                  }}
                >
                  <div
                    className={clsx(
                      "font-semibold relative text-1xl mb-1",
                      dayEvents.length > 0
                        ? "text-primary-600"
                        : "text-muted-foreground",
                      new Date().getDate() === dayObj.day &&
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear()
                        ? "text-secondary-500"
                        : ""
                    )}
                  >
                    {dayObj.day}
                  </div>
                  <div className="flex-grow flex flex-col w-full">
                  
                 
                    {dayEvents.length > 1 && (
                      <Badge
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowMoreEvents(dayEvents);
                        }}
                        variant="default"
                        className="hover:bg-default-200 absolute right-2 text-xs top-2 transition duration-300"
                      >
                        {dayEvents.length > 1
                          ? `+${dayEvents.length - 1}`
                          : " "}
                      </Badge>
                    )}
                    
                    {dayEvents?.length > 0 && (
                         
                         <EventStyled
                           event={{
                             ...dayEvents[0],
                             CustomEventComponent,
                             minmized: true,
                           }}
                           CustomEventModal={CustomEventModal}
                         />
                        
                     )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}