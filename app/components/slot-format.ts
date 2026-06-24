import type { TimeSlot } from "../types/booking";

const timePattern = /\b\d{1,2}:\d{2}\b/g;

export function getSlotStartTime(slot: TimeSlot) {
  const labelTimes = slot.label.match(timePattern) ?? [];

  return slot.startTime || labelTimes[0] || "";
}

export function getSlotEndTime(slot: TimeSlot) {
  const labelTimes = slot.label.match(timePattern) ?? [];

  return slot.endTime || labelTimes[1] || "";
}

export function formatSlotRange(slot: TimeSlot) {
  const startTime = getSlotStartTime(slot);
  const endTime = getSlotEndTime(slot);

  if (startTime && endTime) return `${startTime}–${endTime}`;
  if (startTime) return startTime;
  if (endTime) return endTime;

  const labelTimes = slot.label.match(timePattern) ?? [];
  if (labelTimes.length >= 2) return `${labelTimes[0]}–${labelTimes[1]}`;

  const [hour, minute] = slot.label.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return slot.label;

  const start = new Date(2026, 0, 1, hour, minute);
  const end = new Date(start.getTime() + 45 * 60 * 1000);
  const endLabel = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

  return `${slot.label}–${endLabel}`;
}
