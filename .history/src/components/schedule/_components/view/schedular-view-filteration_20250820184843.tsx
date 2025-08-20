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
import { Link, useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import UnscheduledModel from "../../_modals/unscheduled-model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../ui/dialog";
import { DialogFooter, DialogHeader } from "../../../ui/dialog";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";

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
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setShowDialogType] = useState<
    "configuration" | "confirmation" | null
  >(null);
  
  // Fixed configuration state with proper default values
  const [configuration, setConfiguration] = useState({
    term: "",
    academicYear: String(new Date().getFullYear()),
    location: ""
  });
  
  const [defaultConfigurations, setDefaultConfigurations] = useState({
    semesters: [],
    locations: []
  });
  
  const axios = useUserAxios();
  const { setToastMessage } = useToast();
  const { setExams, unScheduled, setStatus, status, masterTimetable } =
    useExamsSchedule();

  const debouncedUpdateUrl = useDebouncedCallback((view: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", view);
    setSearchParams(newParams, { replace: true });
  }, 300);

  const getConfigurations = async () => {
    try {
      const resp = await axios.get("/api/rooms/configurations");
      const data = resp.data.data;
      setDefaultConfigurations(data);
      
      // Set the initial configuration based on the API response
      if (data.semesters.length > 0 && data.locations.length > 0) {
        setConfiguration({
          term: data.semesters[0].id.toString(),
          academicYear: String(new Date().getFullYear()),
          location: data.locations[0].id.toString()
        });
      }
    } catch (error) {
      setToastMessage({
        message: "Unable to find default timetable configurations, Please try again later.",
        variant: "danger",
      });
    }
  };

  const publishTimeTable = async () => {
    setServerLoadingMessage({
      message: `Publishing timetable ...`,
      isServerLoading: true,
    });

    try {
      const resp = await axios.put("/api/exams/exams/publish/", {
        masterTimetable,
      });
      setToastMessage({
        message: "Timetable published successfully",
        variant: "success",
      });
      setStatus(resp.data.status);
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
        setShowDialog(false);
      }
    });
  };

  useEffect(() => {
    setClientSide(true);
    getConfigurations();
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

  function handleCreateNewTimetable(configuration: any) {
    setOpen(
      <CustomModal contentClass="max-w-md min-w-full min-h-[95vh] mx-4 sm:mx-auto rounded-2xl p-3  shadow-lg">
        <CreateNewTimeTableModal configuration={configuration}/>
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
      const defaultView = isMobile ? "day" : "month";
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
    <Dialog
      open={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        setShowDialogType(null);
      }}
    >
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

                <div className="flex items-center gap-2">
                  {/* Grouped Buttons */}
                  <span>{status}</span>
                  <div className="flex rounded-full border overflow-hidden">
                    <Button
                      onClick={() => {
                        setShowDialogType("configuration");
                        setShowDialog(true);
                      }}
                      className={`${classNames?.buttons?.addEvent} rounded-none first:rounded-l-full last:rounded-none`}
                      variant="default"
                    >
                      <CalendarPlusIcon className="mr-1 h-4 w-4" />
                      New
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => publishTimeTable()}
                    >
                      <PrinterCheckIcon className="w-4 h-4" />
                      <span>Publish</span>
                    </Button>
                  </div>

                  {/* Separate Delete Button */}
                  <Button
                    onClick={() => {
                      setShowDialogType("confirmation")
                      setShowDialog(true)
                    }}
                    className={classNames?.buttons?.addEvent}
                    disabled={isDeletingTimeTables}
                    variant="destructive"
                  >
                    {isDeletingTimeTables ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="mr-1 h-4 w-4" />
                    )}
                    Delete
                  </Button>

                  <Link
                    to={"/admin/timetables"}
                    className="text-blue-400 underline"
                  >
                    More Timetables
                  </Link>
                </div>
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
      {dialogType == "configuration" && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              Timetable Configuration
            </DialogTitle>

            <DialogDescription className="text-sm  max-w-md mx-auto leading-relaxed  text-center">
              Enter the information of desired timetable to generate.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academic_year" className="text-right">
                Academic Year
              </Label>
              <Input 
                type="text" 
                id="academic_year" 
                className="col-span-3" 
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    academicYear: e.target.value
                  })
                }} 
                value={configuration.academicYear}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term
              </Label>
              <select 
                id="term" 
                className="col-span-3 p-2 rounded-md bg-background border" 
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    term: e.target.value
                  })
                }} 
                value={configuration.term}
              >
                {defaultConfigurations.semesters.map((semester: any, index) => {
                  return <option value={semester?.id} key={index}> {semester.name}</option>
                })}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <select  
                id="location" 
                className="col-span-3 p-2 rounded-md bg-background border" 
                onChange={(e) => {
                  setConfiguration({
                    ...configuration,
                    location: e.target.value
                  })
                }} 
                value={configuration.location}
              >
                {defaultConfigurations.locations.map((location: any, index) => {
                  return <option value={location.id} key={index}>
                    {location.name}
                  </option>
                })}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant={"default"} onClick={() => {
              if (configuration.academicYear.trim().length < 4 || 
                  configuration.term.trim().length <= 0 || 
                  configuration.location.trim().length <= 0) {
                setToastMessage({
                  message: "Please complete this form before proceeding",
                  variant: "danger"
                })
                return
              }
              setShowDialogType(null)
              setShowDialog(false)
              handleCreateNewTimetable(configuration)
            }} disabled={configuration.academicYear.trim().length < 4 || 
                         configuration.term.trim().length <= 0 || 
                         configuration.location.trim().length <= 0}>
              Continue
            </Button>
            <Button variant={"secondary"} onClick={() => {
              setShowDialogType(null)
              setShowDialog(false)
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {dialogType == "confirmation" && (
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[90vh] overflow-y-auto ">
          <DialogHeader className="text-center space-y-4 pb-2 flex items-center justify-center">
            <DialogTitle className="text-l font-bold  leading-tight">
              Confirm Delete
            </DialogTitle>

            <DialogDescription className="text-sm  max-w-md mx-auto leading-relaxed  text-center">
              Do you really want to perform this action?
            </DialogDescription>
          </DialogHeader>
          <div className="relative p-4">
            This will only delete students exams records from database, for
            saving space and preventing conflict for the future exams that will
            be generated.
          </div>

          <DialogFooter>
            <Button variant={"default"} onClick={() => deleteAllTimeTables()}>
              Yes
            </Button>
            <Button variant={"secondary"} onClick={() => setShowDialog(false)}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}