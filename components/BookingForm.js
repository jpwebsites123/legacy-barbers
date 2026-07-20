"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const times = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const startingForm = {
  name: "",
  phone: "",
  service: "Haircut",
  date: "",
  time: "",
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPhoneNumber(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 10);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  }

  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
}

function createSlotId(date, time) {
  const cleanedTime = time
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${date}_${cleanedTime}`;
}

export default function BookingForm() {
  const [form, setForm] = useState(startingForm);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  const availableTimes = useMemo(() => {
    return times.filter((time) => !bookedTimes.includes(time));
  }, [bookedTimes]);

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

        if (!isActive) return;

        const unavailableTimes = snapshot.docs.map(
          (slotDocument) => slotDocument.data().time
        );

        setBookedTimes(unavailableTimes);

        const firstAvailableTime = times.find(
          (time) => !unavailableTimes.includes(time)
        );

        setForm((currentForm) => ({
          ...currentForm,
          time: firstAvailableTime || "",
        }));
      } catch (error) {
        console.error("Error loading booked times:", error);

        if (!isActive) return;

        setBookedTimes([]);
        setStatus("Could not load available times. Please refresh and try again.");
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
  }, [form.date]);

  function update(event) {
    const { name, value } = event.target;

    setStatus("");
    setStatusType("");

    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
  }

  async function book(event) {
    event.preventDefault();

    if (isSubmitting) return;

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

    if (!form.date) {
      setStatus("Please choose an appointment date.");
      setStatusType("error");
      return;
    }

    if (form.date < today) {
      setStatus("You cannot book an appointment in the past.");
      setStatusType("error");
      return;
    }

    if (!form.time) {
      setStatus("There are no available times for this date.");
      setStatusType("error");
      return;
    }

    if (!availableTimes.includes(form.time)) {
      setStatus("That time is no longer available. Please choose another.");
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

      const batch = writeBatch(db);

      batch.set(bookingReference, {
        name: trimmedName,
        phone: formatPhoneNumber(phoneNumbers),
        service: form.service,
        date: form.date,
        time: form.time,
        status: "upcoming",
        createdAt: serverTimestamp(),
      });

      batch.set(slotReference, {
        date: form.date,
        time: form.time,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setBookedTimes((currentTimes) => [
        ...new Set([...currentTimes, form.time]),
      ]);

      setStatus("Appointment booked! We look forward to seeing you.");
      setStatusType("success");
      setForm(startingForm);
    } catch (error) {
      console.error("Booking error:", error);

      if (error.code === "permission-denied") {
        setStatus(
          "That time may have just been booked. Choose another time and try again."
        );
      } else {
        setStatus("Something went wrong. Please try again.");
      }

      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClasses =
    "block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";

  const formDisabled = isSubmitting;

  return (
    <div className="w-full min-w-0 max-w-full">
      <form
        onSubmit={book}
        className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4"
      >
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Name</span>

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

        <label className="grid min-w-0 gap-2">
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

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Service</span>

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

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Date</span>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={update}
            required
            min={getTodayDate()}
            disabled={formDisabled}
            className={fieldClasses}
          />
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Time</span>

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
            {!form.date && <option value="">Choose a date first</option>}

            {form.date && isLoadingTimes && (
              <option value="">Loading available times...</option>
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

          {form.date &&
            !isLoadingTimes &&
            availableTimes.length === 0 && (
              <span className="text-sm font-semibold text-red-400">
                This date is fully booked. Please choose another date.
              </span>
            )}
        </label>

        <button
          type="submit"
          disabled={
            formDisabled ||
            isLoadingTimes ||
            !form.date ||
            availableTimes.length === 0
          }
          className="mt-1 w-full max-w-full rounded-xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Book Now"}
        </button>
      </form>

      {status && (
        <p
          aria-live="polite"
          className={`mt-5 max-w-full break-words text-sm font-semibold sm:text-base ${
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