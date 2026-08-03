"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import BookingCalendar from "./BookingCalendar";
import { db } from "../lib/firebase";

const BUSINESS_TIME_ZONE = "America/Toronto";

const defaultBusinessHours = {
  0: {
    name: "Sunday",
    closed: true,
    open: "10:00",
    close: "17:00",
  },
  1: {
    name: "Monday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  2: {
    name: "Tuesday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  3: {
    name: "Wednesday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  4: {
    name: "Thursday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  5: {
    name: "Friday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  6: {
    name: "Saturday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
};

const startingForm = {
  name: "",
  phone: "",
  service: "Haircut",
  date: "",
  time: "",
};

function getBusinessDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }

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

function isCurrentBookingMonth(dateString) {
  if (!dateString) {
    return false;
  }

  const { year, month } = getBusinessDateParts();
  const [selectedYear, selectedMonth] = dateString.split("-").map(Number);

  return selectedYear === year && selectedMonth === month;
}

function getNextMonthOpeningText() {
  const { year, month } = getBusinessDateParts();

  let nextMonth = month + 1;
  let nextYear = year;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const nextMonthDate = new Date(
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T12:00:00`
  );

  return nextMonthDate.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
}

function formatPhoneNumber(value) {
  const numbers = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  }

  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
    6
  )}`;
}

function createSlotId(date, time) {
  const cleanedTime = String(time || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${date}_${cleanedTime}`;
}

function timeToMinutes(time) {
  if (!time || typeof time !== "string") {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const minuteValue = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minuteValue).padStart(2, "0")} ${period}`;
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
    slots.push(formatTime(currentMinutes));
  }

  return slots;
}

function getDayOfWeek(dateString) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, 12, 0, 0).getDay();
}

function getFirebaseErrorCode(error) {
  if (!error) {
    return "";
  }

  return String(error.code || "").replace("firestore/", "");
}

export default function BookingForm() {
  const [form, setForm] = useState(startingForm);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [businessHours, setBusinessHours] = useState(defaultBusinessHours);
  const [closedDates, setClosedDates] = useState([]);
  const [appointmentDuration, setAppointmentDuration] = useState(60);

  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadSchedule() {
      try {
        const settingsReference = doc(db, "settings", "business");
        const settingsSnapshot = await getDoc(settingsReference);

        if (!isActive) {
          return;
        }

        if (settingsSnapshot.exists()) {
          const settingsData = settingsSnapshot.data();

          setBusinessHours({
            ...defaultBusinessHours,
            ...(settingsData.businessHours || {}),
          });

          setClosedDates(
            Array.isArray(settingsData.closedDates)
              ? settingsData.closedDates
              : []
          );

          const savedDuration = Number(settingsData.appointmentDuration);

          setAppointmentDuration(
            [30, 45, 60].includes(savedDuration) ? savedDuration : 60
          );
        }
      } catch (error) {
        console.error("Error loading business schedule:", error);

        if (isActive) {
          setStatus(
            "Could not load the latest business schedule. Default hours are being shown."
          );
          setStatusType("error");
        }
      } finally {
        if (isActive) {
          setIsLoadingSchedule(false);
        }
      }
    }

    loadSchedule();

    return () => {
      isActive = false;
    };
  }, []);

  const dailyTimes = useMemo(() => {
    if (!form.date || !isCurrentBookingMonth(form.date)) {
      return [];
    }

    const dayOfWeek = getDayOfWeek(form.date);

    if (dayOfWeek === null) {
      return [];
    }

    const schedule =
      businessHours[String(dayOfWeek)] || businessHours[dayOfWeek];

    if (
      !schedule ||
      schedule.closed ||
      closedDates.includes(form.date)
    ) {
      return [];
    }

    return generateTimeSlots(
      schedule.open,
      schedule.close,
      appointmentDuration
    );
  }, [
    form.date,
    businessHours,
    closedDates,
    appointmentDuration,
  ]);

  const availableTimes = useMemo(() => {
    return dailyTimes.filter((time) => !bookedTimes.includes(time));
  }, [dailyTimes, bookedTimes]);

  useEffect(() => {
    if (!form.date) {
      setBookedTimes([]);

      setForm((currentForm) => ({
        ...currentForm,
        time: "",
      }));

      return;
    }

    let isActive = true;

    async function loadBookedTimes() {
      setIsLoadingTimes(true);
      setStatus("");
      setStatusType("");

      try {
        const bookedSlotsQuery = query(
          collection(db, "bookedSlots"),
          where("date", "==", form.date)
        );

        const snapshot = await getDocs(bookedSlotsQuery);

        if (!isActive) {
          return;
        }

        const unavailableTimes = snapshot.docs
          .map((slotDocument) => slotDocument.data().time)
          .filter(Boolean);

        setBookedTimes(unavailableTimes);

        const firstAvailableTime = dailyTimes.find(
          (time) => !unavailableTimes.includes(time)
        );

        setForm((currentForm) => ({
          ...currentForm,
          time: firstAvailableTime || "",
        }));
      } catch (error) {
        console.error("Error loading booked times:", error);

        if (!isActive) {
          return;
        }

        const errorCode = getFirebaseErrorCode(error);

        setBookedTimes([]);

        if (errorCode === "permission-denied") {
          setStatus(
            "The booking system cannot read available appointments. Check your Firestore rules."
          );
        } else {
          setStatus(
            "Could not load available appointment times. Please refresh and try again."
          );
        }

        setStatusType("error");

        setForm((currentForm) => ({
          ...currentForm,
          time: "",
        }));
      } finally {
        if (isActive) {
          setIsLoadingTimes(false);
        }
      }
    }

    loadBookedTimes();

    return () => {
      isActive = false;
    };
  }, [form.date, dailyTimes]);

  function update(event) {
    const { name, value } = event.target;

    setStatus("");
    setStatusType("");

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "phone" ? formatPhoneNumber(value) : value,
    }));
  }

  function selectDate(date) {
    setStatus("");
    setStatusType("");

    setForm((currentForm) => ({
      ...currentForm,
      date,
      time: "",
    }));
  }

  async function book(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus("");
    setStatusType("");

    const trimmedName = form.name.trim();
    const phoneNumbers = form.phone.replace(/\D/g, "");
    const today = getTodayDate();

    if (trimmedName.length < 2) {
      setStatus("Please enter your full name.");
      setStatusType("error");
      return;
    }

    if (phoneNumbers.length !== 10) {
      setStatus("Please enter a valid 10-digit phone number.");
      setStatusType("error");
      return;
    }

    if (!form.service) {
      setStatus("Please choose a service.");
      setStatusType("error");
      return;
    }

    if (!form.date) {
      setStatus("Please choose an appointment date.");
      setStatusType("error");
      return;
    }

    if (!isCurrentBookingMonth(form.date)) {
      setStatus(
        "You can only book appointments in the current month."
      );
      setStatusType("error");
      return;
    }

    if (form.date < today) {
      setStatus("You cannot book an appointment in the past.");
      setStatusType("error");
      return;
    }

    if (closedDates.includes(form.date)) {
      setStatus("The barber is closed on this date.");
      setStatusType("error");
      return;
    }

    const dayOfWeek = getDayOfWeek(form.date);

    if (dayOfWeek === null) {
      setStatus("The selected appointment date is invalid.");
      setStatusType("error");
      return;
    }

    const daySchedule =
      businessHours[String(dayOfWeek)] || businessHours[dayOfWeek];

    if (!daySchedule || daySchedule.closed) {
      setStatus("The barber is closed on this day.");
      setStatusType("error");
      return;
    }

    if (!form.time) {
      setStatus("Please choose an appointment time.");
      setStatusType("error");
      return;
    }

    if (!dailyTimes.includes(form.time)) {
      setStatus("That appointment time is not valid.");
      setStatusType("error");
      return;
    }

    if (
      bookedTimes.includes(form.time) ||
      !availableTimes.includes(form.time)
    ) {
      setStatus(
        "That appointment is no longer available. Please choose another time."
      );
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("Booking your appointment...");
    setStatusType("loading");

    try {
      const slotId = createSlotId(form.date, form.time);

      const bookingReference = doc(db, "bookings", slotId);
      const slotReference = doc(db, "bookedSlots", slotId);

      await runTransaction(db, async (transaction) => {
        const existingSlotSnapshot =
          await transaction.get(slotReference);

        if (existingSlotSnapshot.exists()) {
          throw new Error("slot-already-booked");
        }

        transaction.set(bookingReference, {
          name: trimmedName,
          phone: formatPhoneNumber(phoneNumbers),
          service: form.service,
          date: form.date,
          time: form.time,
          appointmentDuration: Number(appointmentDuration),
          status: "upcoming",
          createdAt: serverTimestamp(),
        });

        transaction.set(slotReference, {
          date: form.date,
          time: form.time,
          appointmentDuration: Number(appointmentDuration),
          createdAt: serverTimestamp(),
        });
      });

      setBookedTimes((currentTimes) => {
        return [...new Set([...currentTimes, form.time])];
      });

      setCalendarRefreshKey((currentKey) => currentKey + 1);

      setStatus(
        "Appointment booked! We look forward to seeing you."
      );
      setStatusType("success");

      setForm(startingForm);
    } catch (error) {
      console.error("Booking error:", error);

      const errorCode = getFirebaseErrorCode(error);
      const errorMessage = String(error?.message || "");

      if (errorMessage === "slot-already-booked") {
        setBookedTimes((currentTimes) => {
          return [...new Set([...currentTimes, form.time])];
        });

        setStatus(
          "That appointment has already been booked. Please choose another time."
        );
      } else if (errorCode === "permission-denied") {
        setStatus(
          "The booking system does not have permission to save appointments. Check the Firestore rules."
        );
      } else if (errorCode === "unavailable") {
        setStatus(
          "The booking service is temporarily unavailable. Please try again in a moment."
        );
      } else if (errorCode === "failed-precondition") {
        setStatus(
          "The booking could not be completed because Firebase is missing a required setup. Check the browser console."
        );
      } else if (errorCode === "unauthenticated") {
        setStatus(
          "Firebase rejected the booking because authentication is required."
        );
      } else {
        setStatus(
          "Something went wrong while saving the appointment. Check the browser console for the exact error."
        );
      }

      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClasses =
    "block w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";

  const formDisabled = isSubmitting || isLoadingSchedule;

  return (
    <div className="w-full">
      <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
        <p className="font-bold text-yellow-400">
          Next month opens automatically
        </p>

        <p className="mt-1 text-sm text-zinc-300">
          Bookings for the next month open on{" "}
          {getNextMonthOpeningText()} at 12:00 AM.
        </p>
      </div>

      <form
        onSubmit={book}
        className="grid w-full grid-cols-1 gap-5"
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold sm:text-base">
            Name
          </span>

          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={update}
            required
            minLength={2}
            maxLength={50}
            disabled={formDisabled}
            autoComplete="name"
            className={fieldClasses}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold sm:text-base">
            Phone number
          </span>

          <input
            type="tel"
            name="phone"
            placeholder="(905) 555-1234"
            value={form.phone}
            onChange={update}
            required
            maxLength={14}
            disabled={formDisabled}
            autoComplete="tel"
            inputMode="tel"
            className={fieldClasses}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold sm:text-base">
            Service
          </span>

          <select
            name="service"
            value={form.service}
            onChange={update}
            disabled={formDisabled}
            className={fieldClasses}
          >
            <option value="Haircut">Haircut</option>
            <option value="Skin Fade">Skin Fade</option>
            <option value="Beard Trim">Beard Trim</option>
            <option value="Hair + Beard">Hair + Beard</option>
          </select>
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-semibold sm:text-base">
            Choose a date
          </span>

          {isLoadingSchedule ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-zinc-700 bg-black">
              <p className="text-zinc-400">
                Loading schedule...
              </p>
            </div>
          ) : (
            <BookingCalendar
              selectedDate={form.date}
              onSelectDate={selectDate}
              businessHours={businessHours}
              closedDates={closedDates}
              appointmentDuration={appointmentDuration}
              disabled={formDisabled}
              refreshKey={calendarRefreshKey}
            />
          )}

          {form.date && (
            <p className="text-sm font-semibold text-yellow-400">
              Selected date:{" "}
              {new Date(
                `${form.date}T12:00:00`
              ).toLocaleDateString("en-CA", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: BUSINESS_TIME_ZONE,
              })}
            </p>
          )}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold sm:text-base">
            Time
          </span>

          <select
            name="time"
            value={form.time}
            onChange={update}
            disabled={
              formDisabled ||
              isLoadingTimes ||
              !form.date ||
              availableTimes.length === 0
            }
            required
            className={fieldClasses}
          >
            {!form.date && (
              <option value="">Choose a date first</option>
            )}

            {form.date && isLoadingTimes && (
              <option value="">
                Loading available times...
              </option>
            )}

            {form.date &&
              !isLoadingTimes &&
              availableTimes.length === 0 && (
                <option value="">No times available</option>
              )}

            {form.date &&
              !isLoadingTimes &&
              availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
          </select>

          <span className="text-xs text-zinc-500">
            Appointments are {appointmentDuration} minutes long.
          </span>

          {form.date &&
            !isLoadingTimes &&
            availableTimes.length === 0 && (
              <span className="text-sm font-semibold text-red-400">
                This date is fully booked or closed.
              </span>
            )}
        </label>

        <button
          type="submit"
          disabled={
            formDisabled ||
            isLoadingTimes ||
            !form.date ||
            !form.time ||
            availableTimes.length === 0
          }
          className="mt-1 w-full rounded-xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Book Now"}
        </button>
      </form>

      {status && (
        <p
          aria-live="polite"
          className={`mt-5 break-words text-sm font-semibold sm:text-base ${
            statusType === "success"
              ? "text-green-400"
              : statusType === "error"
                ? "text-red-400"
                : "text-yellow-400"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}