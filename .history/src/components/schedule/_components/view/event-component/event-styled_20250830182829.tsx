"use client";

import React from "react";
import { Badge } from "../../../../ui/badge";
import { Button } from "../../../../ui/button";
import { useModal } from "../../../../../../providers/modal-context";
import AddEventModal from "../../../../schedule/_modals/add-event-modal";
import { Event, CustomEventModal } from "../../../../../../types";
import { TrashIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { useScheduler } from "../../../../../../providers/schedular-provider";
import { motion } from "framer-motion";
import { cn } from "../../../../../lib/utils";
import CustomModal from "../../../../ui/custom-modal";
import RescheduleExamModal from "../../../_modals/RescheduleExamModel";
import StudentExamQrCodeModal from "../../../_modals/StudentExamQrCode";
import { Exam } from "../../../../../pages/studentExams";
import useUser from "../../../../../hooks/useUser";

// Function to format date with responsive options
const formatDate = (date: Date, isMobile: boolean = false) => {
  if (isMobile) {
    // Shorter format for mobile
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
  
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Function to format time only
const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Color variants based on event type
const variantColors = {
  primary: {
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  danger: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-800",
  },
  success: {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-800",
  },
  warning: {
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },
};

interface EventStyledProps extends Event {
  minmized?: boolean;
  CustomEventComponent?: React.FC<Event>;
}

export default function EventStyled({
  event,
  onDelete,
  CustomEventModal,
}: {
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
  onDelete?: (id: string) => void;
}) {
  const { setOpen } = useModal();
  const { handlers } = useScheduler();
  const user = useUser();

  // Determine if delete button should be shown
  // Hide it for minimized events to save space, show on hover instead
  const shouldShowDeleteButton = !event?.minmized;

  // Handler function
  function handleEditEvent(event: Event) {
    // Open the modal with the content
    setOpen(
      user.role == "student" ? (
        <CustomModal title={``}>
          <StudentExamQrCodeModal selectedExam={event as Exam} />
        </CustomModal>
      ) : null,
      async () => {
        return {
          ...event,
        };
      }
    );
  }

  // Get background color class based on variant
  const getBackgroundColor = (variant: string | undefined) => {
    const variantKey = (variant as keyof typeof variantColors) || "primary";
    const colors = variantColors[variantKey] || variantColors.primary;
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  return (
    <div
      key={event?.id}
      className={cn(
        // Base styles with responsive adjustments
        "w-full z-50 relative cursor-pointer border group rounded-lg flex flex-col flex-grow",
        "shadow-sm hover:shadow-md transition-all duration-200",
        
        // Responsive margins and padding
        "m-1 sm:m-2",
        
        // Responsive border
        event?.minmized ? "border-transparent" : "border-default-400/60",
        
        // Responsive sizing
        "min-h-[60px] sm:min-h-[80px]",
        
        // Touch-friendly sizing on mobile
        "touch-manipulation"
      )}
    >
      {event.CustomEventComponent ? (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
              course: event.course,
              start_time: "",
              end_time: "",
              date: "",
              room: event.room,
              status: "",
            });
          }}
          className="w-full"
        >
          <event.CustomEventComponent {...event} />
        </div>
      ) : (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
              course: event.course,
              start_time: "",
              end_time: "",
              date: "",
              room: event.room,
              status: "",
            });
          }}
          className={cn(
            "w-full rounded transition-all duration-200",
            getBackgroundColor(event?.variant),
            
            // Responsive padding
            "p-2 sm:p-3 md:p-4",
            
            // Responsive height
            event?.minmized ? "flex-grow overflow-hidden" : "min-h-fit",
            
            // Hover effects
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Title with responsive text sizing */}
            <div className={cn(
              "font-semibold truncate mb-1",
              // Responsive text sizes
              event?.minmized 
                ? "text-xs sm:text-sm" 
                : "text-sm sm:text-base md:text-lg"
            )}>
              {event?.title || "Untitled Event"}
            </div>

            {/* Course info - only show on larger screens when not minimized */}
            {!event?.minmized && event?.course && (
              <div className="hidden sm:block">
                <Badge 
                  variant="secondary" 
                  className="text-xs mb-2 max-w-fit"
                >
                  {event.course}
                </Badge>
              </div>
            )}

            {/* Show time in minimized mode with responsive sizing */}
            {event?.minmized && (
              <div className="text-[10px] sm:text-xs opacity-80 flex items-center">
                <ClockIcon className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                {formatTime(event?.startDate)}
              </div>
            )}

            {/* Description - responsive visibility and sizing */}
            {!event?.minmized && event?.description && (
              <div className={cn(
                "my-2 line-clamp-2 sm:line-clamp-3",
                // Responsive text sizes
                "text-xs sm:text-sm md:text-base"
              )}>
                {event?.description}
              </div>
            )}

            {/* Room info - show only on larger screens when not minimized */}
            {!event?.minmized && event?.room && (
              <div className="hidden md:block text-xs sm:text-sm opacity-75 mb-2">
                Room: {event.room}
              </div>
            )}

            {/* Date/Time info with responsive layout */}
            {!event?.minmized && (
              <div className="space-y-1 mt-auto">
                {/* Start time */}
                <div className="flex items-center text-xs sm:text-sm">
                  <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {/* Use shorter format on small screens */}
                    <span className="sm:hidden">
                      {formatDate(event?.startDate, true)}
                    </span>
                    <span className="hidden sm:inline">
                      {formatDate(event?.startDate)}
                    </span>
                  </span>
                </div>
                
                {/* End time - only show if different from start time */}
                {event?.endDate && event.endDate.getTime() !== event.startDate.getTime() && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <ClockIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">
                      <span className="sm:hidden">
                        {formatDate(event?.endDate, true)}
                      </span>
                      <span className="hidden sm:inline">
                        {formatDate(event?.endDate)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Mobile-only compact info */}
                <div className="sm:hidden flex items-center justify-between text-xs opacity-75">
                  {event?.course && (
                    <span className="truncate mr-2">{event.course}</span>
                  )}
                  {event?.room && (
                    <span className="truncate">Room {event.room}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delete button - responsive positioning and sizing */}
          {shouldShowDeleteButton && onDelete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "absolute top-1 right-1 sm:top-2 sm:right-2",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event?.id);
                }}
                className={cn(
                  "hover:bg-red-100 hover:text-red-600",
                  // Responsive button sizing
                  "h-6 w-6 sm:h-8 sm:w-8 p-0",
                  // Better touch targets on mobile
                  "touch-manipulation"
                )}
              >
                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}