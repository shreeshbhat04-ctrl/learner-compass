import type { TechEvent } from "@/data/techEvents";

const toUtcDate = (value: string): Date => new Date(`${value}T00:00:00Z`);

const addDays = (value: Date, days: number): Date => {
  const copy = new Date(value.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const asCalendarDay = (value: Date): string => {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const buildEventDetails = (event: TechEvent): string => {
  const lines = [
    `Organizer: ${event.organizer}`,
    `Category: ${event.category}`,
    `Mode: ${event.mode}`,
    `Level: ${event.level}`,
    `Prize: ${event.prize}`,
    `Tags: ${event.tags.join(", ")}`,
    "",
    `Event link: ${event.url}`,
  ];

  return lines.join("\n");
};

export const buildGoogleCalendarEventUrl = (event: TechEvent): string => {
  const startDate = toUtcDate(event.eventStart);
  const endExclusive = addDays(toUtcDate(event.eventEnd), 1);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${asCalendarDay(startDate)}/${asCalendarDay(endExclusive)}`,
    details: buildEventDetails(event),
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
