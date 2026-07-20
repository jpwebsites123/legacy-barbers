"use client";

import { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
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
  time: "10:00 AM",
};

// Gets today's date using the visitor's local timezone
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Formats a phone number like (905) 555-1234
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

export default function BookingForm() {
  const [form, setForm] = useState(startingForm);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(e) {
    const { name, value } = e.target;

    setStatus("");
    setStatusType("");

    setForm((currentForm) => ({
      ...currentForm,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
  }

  async function book(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    const phoneNumbers = form.phone.replace(/\D/g, "");
    const today = getTodayDate();

    // Name validation
    if (trimmedName.length < 2) {
      setStatus("Please enter your full name.");
      setStatusType("error");
      return;
    }

    // Phone validation
    if (phoneNumbers.length !== 10) {
      setStatus("Please enter a valid 10-digit phone number.");
      setStatusType("error");
      return;
    }

    // Date validation
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

    // Time validation
    if (!form.time) {
      setStatus("Please choose an appointment time.");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("Checking availability...");
    setStatusType("loading");

    try {
      const bookingsRef = collection(db, "bookings");

      const availabilityQuery = query(
        bookingsRef,
        where("date", "==", form.date),
        where("time", "==", form.time)
      );

      const existingBookings = await getDocs(availabilityQuery);

      if (!existingBookings.empty) {
        setStatus("That time is already booked. Please choose another time.");
        setStatusType("error");
        return;
      }

      setStatus("Booking your appointment...");

      await addDoc(bookingsRef, {
        name: trimmedName,
        phone: formatPhoneNumber(phoneNumbers),
        service: form.service,
        date: form.date,
        time: form.time,
        status: "upcoming",
        createdAt: serverTimestamp(),
      });

      setStatus("Appointment booked! We look forward to seeing you.");
      setStatusType("success");
      setForm(startingForm);
    } catch (error) {
      console.error("Booking error:", error);

      if (error.code === "permission-denied") {
        setStatus(
          "Firebase blocked the booking. Check your Firestore security rules."
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className={fieldClasses}
          />
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Time</span>

          <select
            name="time"
            value={form.time}
            onChange={update}
            disabled={isSubmitting}
            className={fieldClasses}
          >
            {times.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
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