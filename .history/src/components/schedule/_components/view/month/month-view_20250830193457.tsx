"use client";

import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { Badge } from "../../../../ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

import { useScheduler } from "../../../../../../providers/schedular-provider";
import { useModal } from "../../../../../../providers/modal-context";
import AddEventModal from "../../../../../components/schedule/_modals/add-event-modal";
import ShowMoreEventsModal from "../../../../../components/schedule/_modals/show-more-events-modal";
import EventStyled from "../event-component/event-styled";
import { Event, CustomEventModal } from "../../../../../../types";
import CustomModal from "../../../../ui/custom-modal";

interface DayObj {
  day: number;
}

const pageTransitionVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { opacity: { duration: 0.2, ease: "easeInOut" } },
  },
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

  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }, [currentDate]);

  function handleAddEvent(selectedDay: number) {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay,
      0,
      0,
      0
    );
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
      async () => ({
        startDate,
        endDate,
        title: "",
        id: "",
        variant: "primary",
      })
    );
  }

  function handleShowMoreEvents(dayEvents: Event[]) {
    setOpen(
      <CustomModal title={dayEvents && dayEvents[0]?.startDate.toDateString()}>
        <ShowMoreEventsModal />
      </CustomModal>,
      async () => ({ dayEvents })
    );
  }

  const itemVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const daysOfWeek =
    weekStartsOn === "monday"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startDayOfWeek = firstDayOfMonth.getDay();
  const adjustedStartDay =
    weekStartsOn === "monday"
      ? startDayOfWeek === 0
        ? 6
        : startDayOfWeek - 1
      : startDayOfWeek;

  // Split into weeks for clean rows
  const weeks: (DayObj | null)[][] = [];
  let week: (DayObj | null)[] = Array(adjustedStartDay).fill(null);
  daysInMonth.forEach((dayObj) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(dayObj);
  });
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header: Month + Buttons + Days of Week */}
      <div className="sticky top-0 bg-white z-30 py-3">
        {/* Month + Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <motion.h2
            key={currentDate.getMonth()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl tracking-tighter font-bold"
          >
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </motion.h2>
          <div className="flex gap-3 mt-2 sm:mt-0">
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

        {/* Days of Week in SAME header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 ml-4">
          {daysOfWeek.map((day) => (
            <div
              key={`header-${day}`}
              className="text-center py-2 text-lg font-medium"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Weeks */}
      <div className="overflow-y-auto max-h-[600px]">
        {weeks.map((week, weekIdx) => (
          <div
            key={`week-${weekIdx}`}
            className="grid grid-cols-7 gap-1 sm:gap-2 ml-4"
          >
            {week.map((dayObj, idx) =>
              dayObj ? (
                <motion.div
                  key={dayObj.day}
                  className="hover:z-50 border-none   rounded group flex flex-col my-2"
                  variants={itemVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <Card
                    className="shadow-md cursor-pointer   relative flex p-4 border h-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const dayEvents = getters.getEventsForDay(
                        dayObj.day,
                        currentDate
                      );
                      handleShowMoreEvents(dayEvents);
                    }}
                  >
                    <div
                      className={clsx(
                        "font-semibold relative text-1xl mb-1",
                        getters.getEventsForDay(dayObj.day, currentDate).length >
                          0
                          ? "text-primary-600"
                          : "text-muted-foreground",
                        new Date().getDate() === dayObj.day &&
                          new Date().getMonth() === currentDate.getMonth() &&
                          new Date().getFullYear() ===
                            currentDate.getFullYear()
                          ? "text-secondary-500"
                          : ""
                      )}
                    >
                      {dayObj.day}
                    </div>
                    <div className="flex-grow flex flex-col w-full">
                      {getters.getEventsForDay(dayObj.day, currentDate).length >
                        1 && (
                        <Badge
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowMoreEvents(
                              getters.getEventsForDay(dayObj.day, currentDate)
                            );
                          }}
                          variant="default"
                          className="hover:bg-default-200 absolute right-2 text-xs top-2 transition duration-300"
                        >
                          {`+${
                            getters.getEventsForDay(dayObj.day, currentDate)
                              .length - 1
                          }`}
                        </Badge>
                      )}
                      {getters.getEventsForDay(dayObj.day, currentDate)
                        ?.length > 0 && (
                        <EventStyled
                          event={{
                            ...getters.getEventsForDay(
                              dayObj.day,
                              currentDate
                            )[0],
                            CustomEventComponent,
                            minmized: true,
                          }}
                          CustomEventModal={CustomEventModal}
                        />
                      )}
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div key={`empty-${idx}`} className="h-[100px]" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
