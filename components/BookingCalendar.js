"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const BUSINESS_TIME_ZONE = "America/Toronto";
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getBusinessDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  });

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

function createDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function getTodayDate() {
  const { year, month, day } = getBusinessDateParts();
  return createDateKey(year, month, day);
}

function timeToMinutes(time) {
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function generateTimeSlots(openTime, closeTime, duration) {
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  const appointmentDuration = Number(duration) || 60;

  if (
    !openTime ||
    !closeTime ||
    closeMinutes <= openMinutes ||
    appointmentDuration <= 0
  ) {
    return [];
  }

  const slots = [];

  for (
    let currentMinutes = openMinutes;
    currentMinutes + appointmentDuration <= closeMinutes;
    currentMinutes += appointmentDuration
  ) {
    slots.push(currentMinutes);
  }

  return slots;
}

function getDateStatus({
  dateKey,
  dayOfWeek,
  bookingCount,
  businessHours,
  closedDates,
  appointmentDuration,
}) {
  const today = getTodayDate();

  if (dateKey < today) {
    return {
      type: "closed",
      label: "Past",
      remaining: 0,
      totalSlots: 0,
    };
  }

  if (closedDates.includes(dateKey)) {
    return {
      type: "closed",
      label: "Closed",
      remaining: 0,
      totalSlots: 0,
    };
  }

  const schedule = businessHours[String(dayOfWeek)];

  if (!schedule || schedule.closed) {
    return {
      type: "closed",
      label: "Closed",
      remaining: 0,
      totalSlots: 0,
    };
  }

  const slots = generateTimeSlots(
    schedule.open,
    schedule.close,
    appointmentDuration
  );

  const totalSlots = slots.length;
  const remaining = Math.max(totalSlots - bookingCount, 0);

  if (totalSlots === 0) {
    return {
      type: "closed",
      label: "Closed",
      remaining: 0,
      totalSlots: 0,
    };
  }

  if (remaining === 0) {
    return {
      type: "full",
      label: "Full",
      remaining: 0,
      totalSlots,
    };
  }

  const fewSpotsLimit = Math.max(2, Math.ceil(totalSlots * 0.4));

  if (remaining <= fewSpotsLimit) {
    return {
      type: "limited",
      label: `${remaining} left`,
      remaining,
      totalSlots,
    };
  }

  return {
    type: "available",
    label: `${remaining} left`,
    remaining,
    totalSlots,
  };
}

export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  businessHours,
  closedDates = [],
  appointmentDuration = 60,
  disabled = false,
  refreshKey = 0,
}) {
  const [businessDate, setBusinessDate] = useState(getBusinessDateParts);
  const [bookingCounts, setBookingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      const latestDate = getBusinessDateParts();

      setBusinessDate((currentDate) => {
        if (
          currentDate.year === latestDate.year &&
          currentDate.month === latestDate.month &&
          currentDate.day === latestDate.day
        ) {
          return currentDate;
        }

        return latestDate;
      });
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const year = businessDate.year;
  const monthNumber = businessDate.month;
  const monthIndex = monthNumber - 1;

  useEffect(() => {
    let isActive = true;

    async function loadMonthBookings() {
      setLoading(true);
      setCalendarError("");

      const monthStart = createDateKey(year, monthNumber, 1);
      const lastDay = new Date(year, monthNumber, 0).getDate();
      const monthEnd = createDateKey(year, monthNumber, lastDay);

      try {
        const monthQuery = query(
          collection(db, "bookedSlots"),
          where("date", ">=", monthStart),
          where("date", "<=", monthEnd)
        );

        const snapshot = await getDocs(monthQuery);

        if (!isActive) return;

        const counts = {};

        snapshot.docs.forEach((slotDocument) => {
          const slotData = slotDocument.data();

          if (!slotData.date) return;

          counts[slotData.date] = (counts[slotData.date] || 0) + 1;
        });

        setBookingCounts(counts);
      } catch (error) {
        console.error("Error loading calendar availability:", error);

        if (!isActive) return;

        setBookingCounts({});
        setCalendarError("Could not load calendar availability.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadMonthBookings();

    return () => {
      isActive = false;
    };
  }, [year, monthNumber, refreshKey]);

  const calendarDays = useMemo(() => {
    const firstWeekDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];

    for (let index = 0; index < firstWeekDay; index += 1) {
      days.push({
        day: null,
        dateKey: `empty-start-${index}`,
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, monthIndex, day);

      days.push({
        day,
        dateKey: createDateKey(year, monthNumber, day),
        dayOfWeek: date.getDay(),
        currentMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      days.push({
        day: null,
        dateKey: `empty-end-${days.length}`,
        currentMonth: false,
      });
    }

    return days;
  }, [year, monthIndex, monthNumber]);

  const monthTitle = new Date(year, monthIndex, 1).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthIsFullyBooked = useMemo(() => {
    if (loading) return false;

    return !calendarDays.some((calendarDay) => {
      if (!calendarDay.currentMonth) return false;

      const status = getDateStatus({
        dateKey: calendarDay.dateKey,
        dayOfWeek: calendarDay.dayOfWeek,
        bookingCount: bookingCounts[calendarDay.dateKey] || 0,
        businessHours,
        closedDates,
        appointmentDuration,
      });

      return status.type === "available" || status.type === "limited";
    });
  }, [
    loading,
    calendarDays,
    bookingCounts,
    businessHours,
    closedDates,
    appointmentDuration,
  ]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-black">
      <div className="border-b border-zinc-800 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
          Now booking
        </p>

        <h3 className="mt-1 text-xl font-black sm:text-2xl">{monthTitle}</h3>

        <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
          Only appointments in the current month can be booked.
        </p>
      </div>

      {monthIsFullyBooked && !loading && (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-400">
          This month is fully booked.
        </div>
      )}

      <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-1 py-3 text-center text-xs font-bold uppercase text-zinc-500 sm:text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

            <p className="mt-4 text-sm text-zinc-400">
              Loading availability...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {calendarDays.map((calendarDay) => {
            if (!calendarDay.currentMonth) {
              return (
                <div
                  key={calendarDay.dateKey}
                  className="min-h-20 border-b border-r border-zinc-800 bg-zinc-950/50 sm:min-h-24"
                />
              );
            }

            const status = getDateStatus({
              dateKey: calendarDay.dateKey,
              dayOfWeek: calendarDay.dayOfWeek,
              bookingCount: bookingCounts[calendarDay.dateKey] || 0,
              businessHours,
              closedDates,
              appointmentDuration,
            });

            const selectable =
              status.type === "available" || status.type === "limited";

            const isSelected = selectedDate === calendarDay.dateKey;

            const statusClasses = {
              available:
                "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20",
              limited:
                "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
              full:
                "cursor-not-allowed border-red-500/20 bg-red-500/10 text-red-400",
              closed:
                "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600",
            };

            return (
              <button
                key={calendarDay.dateKey}
                type="button"
                disabled={!selectable || disabled}
                onClick={() => onSelectDate(calendarDay.dateKey)}
                className={`relative min-h-20 border-b border-r p-1.5 text-left transition sm:min-h-24 sm:p-2 ${
                  statusClasses[status.type]
                } ${
                  isSelected
                    ? "z-10 ring-2 ring-inset ring-yellow-400"
                    : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${
                    isSelected ? "bg-yellow-400 text-black" : ""
                  }`}
                >
                  {calendarDay.day}
                </span>

                <span className="mt-1 block truncate text-[9px] font-bold uppercase sm:text-xs">
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 p-4 text-xs font-semibold sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Available
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500" />
          Few spots
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Fully booked
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-zinc-600" />
          Closed
        </div>
      </div>

      {calendarError && (
        <p className="border-t border-zinc-800 p-4 text-sm font-semibold text-red-400">
          {calendarError}
        </p>
      )}
    </div>
  );
}