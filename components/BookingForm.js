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

export default function BookingForm() {
  const [form, setForm] = useState(startingForm);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(e) {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }));
  }

  async function book(e) {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus("Checking availability...");

    try {
      const bookingsRef = collection(db, "bookings");

      const availabilityQuery = query(
        bookingsRef,
        where("date", "==", form.date),
        where("time", "==", form.time)
      );

      const existingBookings = await getDocs(availabilityQuery);

      if (!existingBookings.empty) {
        setStatus("That time is already booked. Pick another time.");
        return;
      }

      await addDoc(bookingsRef, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        service: form.service,
        date: form.date,
        time: form.time,
        createdAt: serverTimestamp(),
      });

      setStatus("Appointment booked successfully!");
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
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClasses =
    "block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base text-white outline-none transition focus:border-yellow-400";

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
            placeholder="Your name"
            value={form.name}
            onChange={update}
            required
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
            placeholder="Phone number"
            value={form.phone}
            onChange={update}
            required
            className={fieldClasses}
          />
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Service</span>

          <select
            name="service"
            value={form.service}
            onChange={update}
            className={fieldClasses}
          >
            <option>Haircut</option>
            <option>Skin Fade</option>
            <option>Beard Trim</option>
            <option>Hair + Beard</option>
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
            className={fieldClasses}
          />
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-semibold sm:text-base">Time</span>

          <select
            name="time"
            value={form.time}
            onChange={update}
            className={fieldClasses}
          >
            {times.map((time) => (
              <option key={time}>{time}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full max-w-full rounded-xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Checking Availability..." : "Book Now"}
        </button>
      </form>

      {status && (
        <p
          className={`mt-5 max-w-full break-words text-sm font-semibold sm:text-base ${
            status.includes("successfully")
              ? "text-green-400"
              : status.includes("already") ||
                  status.includes("wrong") ||
                  status.includes("blocked")
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