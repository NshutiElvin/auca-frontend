import EventStyled from "../../schedule/_components/view/event-component/event-styled";
import { useModal } from "../../../../providers/modal-context";
import { Event } from "../../../../types";
import React, { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ScrollArea } from "../../scroll-area";

export default function ShowMoreEventsModal() {
  const { data } = useModal();
  const dayEvents = data?.default?.dayEvents || [];

  const [events, setEvents] = useState<Event[]>(dayEvents);

  useEffect(() => {
    setEvents(dayEvents);
  }, [dayEvents]);

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea className="h-[50vh] rounded-md border p-4">
        {events.length > 0 ? (
        events.map((event: Event) => (
          <EventStyled
            onDelete={(id) => {
              setEvents(events.filter((event) => event.id !== id));
            }}
            key={event.id}
            event={{
              ...event,
            }}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CalendarIcon className="h-12 w-12 text-primary mb-2" />
          <p className="text-lg font-medium text-primary">No exam found</p>
          <p className="text-sm text-muted-foreground">There are no exams scheduled for this day.</p>
        </div>
      )}

      </ScrollArea>
    </div>
  );
}
