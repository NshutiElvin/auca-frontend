import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../..//ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Calendar as CalendarIcon,
  CalendarDaysIcon,
  TrashIcon,
  Loader,
  PrinterCheckIcon,
  CalendarPlusIcon,
} from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModal } from "../../../../../providers/modal-context";
import {
  ClassNames,
  CustomComponents,
  Views,
} from "../../../../../types/index";
import { cn } from "../../../../lib/utils";
import CustomModal from "../../../ui/custom-modal";
import CreateNewTimeTableModal from "../../_modals/createNewTimeTableModal";
import useUserAxios from "../../../../hooks/useUserAxios";
import useToast from "../../../../hooks/useToast";
import { isAxiosError } from "axios";
import useExamsSchedule from "../../../../hooks/useExamShedule";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import UnscheduledModel from "../../_modals/unscheduled-model";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: "spring", stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: {
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<string>("month");
  const [clientSide, setClientSide] = useState(false);
  const [isDeletingTimeTables, startTransition] = useTransition();
  const axios = useUserAxios();
  const { setToastMessage } = useToast();
  const { setExams, unScheduled, setStatus, status, masterTimetable } = useExamsSchedule();

  const debouncedUpdateUrl = useDebouncedCallback((view: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", view);
    setSearchParams(newParams, { replace: true });
  }, 300);

  const publishTimeTable = async () => {
    setServerLoadingMessage({
      message: `Publishing timetable ...`,
      isServerLoading: true,
    });
   
      try {
       const resp= await axios.put("/api/exams/exams/publish/", {masterTimetable});
        setToastMessage({
          message: "Timetable published successfully",
          variant: "success",
        });
        setExams([]);
        setStatus(resp.data.status)
      } catch (error) {
        if (isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage({
            message: String(message),
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
    
  };


    const deleteAllTimeTables = () => {
    setServerLoadingMessage({
      message: `Deleting timetables`,
      isServerLoading: true,
    });
    startTransition(async () => {
      try {
        await axios.delete("/api/exams/exams/truncate-all/");
        setToastMessage({
          message: "Timetable deleted successfully",
          variant: "success",
        });
        setExams([]);
      } catch (error) {
        if (isAxiosError(error)) {
          const message = error.response?.data?.message;
          setToastMessage({
            message: String(message),
            variant: "danger",
          });
        } else {
          setToastMessage({
            message: "Something went wrong",
            variant: "danger",
          });
        }
      } finally {
        setServerLoadingMessage({ isServerLoading: false });
      }
    });
  };

  useEffect(() => {
    setClientSide(true);
  }, []);

  const [isMobile, setIsMobile] = useState(
    clientSide ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (!clientSide) return;
    setIsMobile(window.innerWidth <= 768);
    function handleResize() {
      if (window && window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window && window.addEventListener("resize", handleResize);

    return () => window && window.removeEventListener("resize", handleResize);
  }, [clientSide]);
  useEffect(() => {
    if (unScheduled.length > 0) {
      setOpen(
        <CustomModal contentClass="max-w-md w-full mx-4 sm:mx-auto rounded-2xl p-6 shadow-lg">
          <UnscheduledModel />
        </CustomModal>
      );
    }
  }, [unScheduled]);

  function handleAddEvent(selectedDay?: number) {
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      23,
      59,
      59,
      999
    );

    setOpen(
      <CustomModal
        title="Create New Exam Schedule"
        contentClass="max-w-md min-w-[calc(100%-5rem)] mx-4 sm:mx-auto rounded-2xl p-6 shadow-lg"
      >
        <CreateNewTimeTableModal />
      </CustomModal>
    );
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  useEffect(() => {
    if (!viewsSelector?.length) return;

    const urlView = searchParams.get("view");

    if (urlView && viewsSelector.includes(urlView)) {
      setActiveView(urlView);
    } else {
      const defaultView = isMobile ? "day" : "month"; // Default view if no valid view is found
      setActiveView(defaultView);
      debouncedUpdateUrl(defaultView);
    }
  }, [viewsSelector, searchParams]);

  const handleViewChange = (newView: string) => {
    setActiveView(newView);
    debouncedUpdateUrl(newView);
  };
  const { setServerLoadingMessage, serverLoadingMessage } = useToast();

  return (
    <div
      className={`flex w-full flex-col  ${
        serverLoadingMessage?.isServerLoading &&
        "pointer-events-none opacity-20"
      }`}
    >
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={handleViewChange}
            className={cn("w-full", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-3">
                {viewsSelector?.includes("day") && (
                  <TabsTrigger value="day">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={15} />
                        <span>Day</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("week") && (
                  <TabsTrigger value="week">
                    {CustomComponents?.customTabs?.CustomWeekTab ? (
                      CustomComponents.customTabs.CustomWeekTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarWeek />
                        <span>Week</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("month") && (
                  <TabsTrigger value="month">
                    {CustomComponents?.customTabs?.CustomMonthTab ? (
                      CustomComponents.customTabs.CustomMonthTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarMonth />
                        <span>Month</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Add Event Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={() => handleAddEvent()}>
                  {CustomComponents?.customButtons.CustomAddEventButton}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Grouped Buttons */}
                  <span>{status}</span>
                  <div className="flex rounded-full border overflow-hidden">

                    <Button
                      onClick={() => handleAddEvent()}
                      className={`${classNames?.buttons?.addEvent} rounded-none first:rounded-l-full last:rounded-none`}
                      variant="default"
                    >
                      <CalendarPlusIcon className="mr-1 h-4 w-4" />
                      New
                    </Button>
                    <Button
                      
                      variant="secondary"
                      onClick={()=>publishTimeTable()}
                    >
                      <PrinterCheckIcon className="w-4 h-4" />
                      <span>Publish</span>
                    </Button>
                  </div>

                  {/* Separate Delete Button */}
                  <Button
                    onClick={() => deleteAllTimeTables()}
                    className={classNames?.buttons?.addEvent}
                    disabled={isDeletingTimeTables}
                    variant="destructive"
                  >
                    {isDeletingTimeTables ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="mr-1 h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {viewsSelector?.includes("day") && (
              <TabsContent value="day">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <DailyView
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("week") && (
              <TabsContent value="week">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <WeeklyView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("month") && (
              <TabsContent value="month">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <MonthView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
