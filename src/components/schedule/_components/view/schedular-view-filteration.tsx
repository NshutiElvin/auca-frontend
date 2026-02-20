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
import type { Event } from "../../../../../types";
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
import ConstraintsConfig from "../../../Config";

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
  const [data, setData] = useState<any[] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | null>(
    null
  );
  const [dialogType, setShowDialogType] = useState<
    "configuration" | "confirmation" | null
  >(null);



  const getTimetables = async () => {
    try {
      const resp = await axios.get("/api/schedules/timetables/");
      setSelectedTimetableId(
        resp.data.data.length > 0 ? resp.data.data[0].id : null
      );
      setData(resp.data.data);
    } catch (error) {
      setToastMessage({
        message: "Unable to fetch timetables, Please try again later.",
        variant: "danger",
      });
    }
  };

  // Fixed configuration state with proper default values
  const [configuration, setConfiguration] = useState({
    term: "",
    academicYear: String(new Date().getFullYear()),
    location: "",
    constraints: {},
  });

  const [defaultConfigurations, setDefaultConfigurations] = useState({
    semesters: [],
    locations: [],
  });

  const axios = useUserAxios();
  const { setToastMessage } = useToast();
  const { setExams, unScheduled, setStatus, status, masterTimetable, exams } =
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
          location: data.locations[0].id.toString(),
          constraints: {},
        });
      }
    } catch (error) {
      setToastMessage({
        message:
          "Unable to find default timetable configurations, Please try again later.",
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
        masterTimetable: selectedTimetableId,
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
        await axios.delete("/api/exams/exams/truncate-mastertimetable/", {
          data: { id: selectedTimetableId },
        });
        setToastMessage({
          message: "Timetable deleted successfully",
          variant: "success",
        });
        const deletedId = selectedTimetableId;
        const remainingTimetables = exams?.filter(
          (timetable) => deletedId !== null && Number.parseInt(timetable.id) !== deletedId) || [];
        setSelectedTimetableId(remainingTimetables[0]?.id ? Number.parseInt(remainingTimetables[0]?.id) : null);
        setExams(remainingTimetables);
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
    setExams([]);
    if (selectedTimetableId) {
      const fetchExams = async () => {
        setServerLoadingMessage({
          message: "Loading timetable...",
          isServerLoading: true,
        });
        try {
          const resp = await axios.get(
            `/api/exams/exams?id=${selectedTimetableId}`
          );
          const respTyped = resp as { data: any };
          const datas: any[] = respTyped.data.data.map((ex: any) => {
            const startDate = new Date(`${ex.date}T${ex.start_time}`);
            const endDate = new Date(`${ex.date}T${ex.end_time}`);
            let examEvent: any = {
              title: `${ex.group.course.title} - Group ${ex.group.group_name}`,
              description: ex.status,
              id: String(ex.id),
              startDate: startDate,
              endDate: endDate,
            };
            return examEvent;
          });

          setExams(datas);
          setStatus(resp.data.status);
        } catch (error) {
          setToastMessage({
            message:
              "Unable to fetch exams for the selected timetable, Please try again later.",
            variant: "danger",
          });
        } finally {
          setServerLoadingMessage({
            isServerLoading: false,
            message: "",
          });
        }
      };
      fetchExams();
    }
  }, [selectedTimetableId]);

  useEffect(() => {
    setClientSide(true);

    Promise.all([getConfigurations(), getTimetables()]);
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
      <CustomModal contentClass="max-w-md min-w-full mx-4 sm:mx-auto rounded-2xl p-3 shadow-lg">
        <CreateNewTimeTableModal configuration={configuration} />
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
        className={cn(
          "flex w-full flex-col space-y-6 p-6",
          serverLoadingMessage?.isServerLoading && "pointer-events-none opacity-50"
        )}
      >
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section - View Tabs */}
          <div className="flex-1 min-w-0">
            <Tabs
              value={activeView}
              onValueChange={handleViewChange}
              className={cn("w-full", classNames?.tabs)}
            >
              <TabsList className="grid w-fit grid-cols-3 h-11">
                {viewsSelector?.includes("day") && (
                  <TabsTrigger value="day" className="px-4">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={16} />
                        <span className="hidden sm:inline">Day</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("week") && (
                  <TabsTrigger value="week" className="px-4">
                    {CustomComponents?.customTabs?.CustomWeekTab ? (
                      CustomComponents.customTabs.CustomWeekTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarWeek size={16} />
                        <span className="hidden sm:inline">Week</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("month") && (
                  <TabsTrigger value="month" className="px-4">
                    {CustomComponents?.customTabs?.CustomMonthTab ? (
                      CustomComponents.customTabs.CustomMonthTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarMonth size={16} />
                        <span className="hidden sm:inline">Month</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          {/* Right Section - Actions and Controls */}
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
            {/* Status Badge */}
          

            {/* Timetable Selector */}
            <div className="flex flex-col space-y-1 min-w-0 lg:min-w-[200px] mx-3 items-center">
              <Label htmlFor="timetable-selector" className="text-xs font-medium text-muted-foreground">
                Select Timetable   {status && (
              <div className="flex items-center">
                <span className="text-sm font-medium px-3 py-1 rounded-full border bg-muted/50">
                  {status}
                </span>
              </div>
            )}
              </Label>
              <select
                title="Select Timetable"
                id="timetable-selector"
                className="h-9 px-3 py-1 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 truncate"
                onChange={async (e) => {
                  const timetableId = e.target.value;
                  setSelectedTimetableId(
                    timetableId ? parseInt(timetableId) : null
                  );
                }}
                value={masterTimetable || ""}
              >
                <option value="">Select Timetable</option>
                {data?.map((timetable) => (
                  <option key={timetable.id} value={timetable.id}>
                    {`${timetable.academic_year} -${timetable.semester.name} - ${timetable.location.name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Primary Actions Group */}
              <div className="flex rounded-md border overflow-hidden">
                <Button
                  onClick={() => {
                    setShowDialogType("configuration");
                    setShowDialog(true);
                  }}
                  className={cn(
                    "rounded-none border-0 px-4 h-9",
                    classNames?.buttons?.addEvent
                  )}
                  variant="default"
                  size="sm"
                >
                  <CalendarPlusIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => publishTimeTable()}
                  className="rounded-none border-0 border-l px-4 h-9"
                  size="sm"
                >
                  <PrinterCheckIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Publish</span>
                </Button>
              </div>

              {/* Delete Button */}
              <Button
                onClick={() => {
                  setShowDialogType("confirmation");
                  setShowDialog(true);
                }}
                className={cn("px-4 h-9", classNames?.buttons?.addEvent)}
                disabled={isDeletingTimeTables}
                variant="outline"
                size="sm"
              >
                {isDeletingTimeTables ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <TrashIcon className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-h-0">
          <Tabs
            value={activeView}
            onValueChange={handleViewChange}
            className={cn("h-full", classNames?.tabs)}
          >
            {viewsSelector?.includes("day") && (
              <TabsContent value="day" className="mt-0 h-full">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig} className="h-full">
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
              <TabsContent value="week" className="mt-0 h-full">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig} className="h-full">
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
              <TabsContent value="month" className="mt-0 h-full">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig} className="h-full">
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

      {/* Configuration Dialog */}
      {dialogType === "configuration" && (
        <DialogContent className="sm:max-w-[70vw] ">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-center">
              Timetable Configuration
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              
              Enter the information for the desired timetable to generate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year" className="text-sm font-medium">
                  Academic Year
                </Label>
                <Input
                  type="text"
                  id="academic_year"
                  placeholder="e.g., 2024"
                  className="h-10"
                  onChange={(e) => {
                    setConfiguration({
                      ...configuration,
                      academicYear: e.target.value,
                    });
                  }}
                  value={configuration.academicYear}
                />
              </div>

            

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Campus
                </Label>
                <select
                  title="Select Campus"
                  id="location"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onChange={(e) => {
                    setConfiguration({
                      ...configuration,
                      location: e.target.value,
                    });
                  }}
                  value={configuration.location}
                >
                  <option value="">Select a location</option>
                  {defaultConfigurations.locations.map((location: any, index) => (
                    <option value={location.id} key={index}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

           
            </div>
             <ConstraintsConfig onConfigChange={(config) => {
                setConfiguration({
                  ...configuration,
                  constraints: config
                });
              }}  />
          </div>

            

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialogType(null);
                setShowDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (
                  configuration.academicYear.trim().length < 4 ||
                  configuration.term.trim().length <= 0 ||
                  configuration.location.trim().length <= 0
                ) {
                  setToastMessage({
                    message: "Please complete this form before proceeding",
                    variant: "danger",
                  });
                  return;
                }
                setShowDialogType(null);
                setShowDialog(false);
                handleCreateNewTimetable(configuration);
              }}
              disabled={
                configuration.academicYear.trim().length < 4 ||
                configuration.term.trim().length <= 0 ||
                configuration.location.trim().length <= 0
              }
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {/* Confirmation Dialog */}
      {dialogType === "confirmation" && (
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-center">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Are you sure you want to delete this timetable?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm text-muted-foreground">
                This will permanently delete the timetable and all associated exams. 
                This action cannot be undone.
              </p>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDialogType(null);
                setShowDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteAllTimeTables()}
              disabled={isDeletingTimeTables}
            >
              {isDeletingTimeTables ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Timetable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}