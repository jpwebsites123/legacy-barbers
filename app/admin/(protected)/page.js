"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function createDateKey(year, month, day) {
  const formattedMonth = String(month + 1).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalServices: 0,
    totalGalleryImages: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    async function loadDashboard() {
      try {
        const bookingsSnapshot = await getDocs(
          collection(db, "bookings")
        );

        const bookingList = bookingsSnapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        }));

        const upcomingQuery = query(
          collection(db, "bookings"),
          where("status", "==", "upcoming")
        );

        const upcomingSnapshot = await getDocs(upcomingQuery);

        const servicesSnapshot = await getDocs(
          collection(db, "services")
        );

        const gallerySnapshot = await getDocs(
          collection(db, "gallery")
        );

        setBookings(bookingList);

        setStats({
          totalBookings: bookingsSnapshot.size,
          upcomingBookings: upcomingSnapshot.size,
          totalServices: servicesSnapshot.size,
          totalGalleryImages: gallerySnapshot.size,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: "📅",
    },
    {
      label: "Upcoming Bookings",
      value: stats.upcomingBookings,
      icon: "⏳",
    },
    {
      label: "Services",
      value: stats.totalServices,
      icon: "✂️",
    },
    {
      label: "Gallery Images",
      value: stats.totalGalleryImages,
      icon: "🖼️",
    },
  ];

  const bookedDates = useMemo(() => {
    const dateCounts = {};

    bookings.forEach((booking) => {
      if (!booking.date || booking.status === "cancelled") {
        return;
      }

      dateCounts[booking.date] = (dateCounts[booking.date] || 0) + 1;
    });

    return dateCounts;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const numberOfDays = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    for (let index = firstDayOfMonth - 1; index >= 0; index -= 1) {
      const day = previousMonthDays - index;
      const previousDate = new Date(year, month - 1, day);

      days.push({
        day,
        dateKey: createDateKey(
          previousDate.getFullYear(),
          previousDate.getMonth(),
          day
        ),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= numberOfDays; day += 1) {
      days.push({
        day,
        dateKey: createDateKey(year, month, day),
        currentMonth: true,
      });
    }

    let nextMonthDay = 1;

    while (days.length < 42) {
      const nextDate = new Date(year, month + 1, nextMonthDay);

      days.push({
        day: nextMonthDay,
        dateKey: createDateKey(
          nextDate.getFullYear(),
          nextDate.getMonth(),
          nextMonthDay
        ),
        currentMonth: false,
      });

      nextMonthDay += 1;
    }

    return days;
  }, [calendarDate]);

  const today = new Date();

  const todayKey = createDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const monthTitle = calendarDate.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  function previousMonth() {
    setCalendarDate(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        )
    );
  }

  function nextMonth() {
    setCalendarDate(
      (currentDate) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        )
    );
  }

  function goToToday() {
    setCalendarDate(new Date());
  }

  return (
    <main className="p-5 sm:p-8">
      <p className="font-semibold uppercase text-yellow-400">
        Legacy Barbers
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Dashboard
      </h1>

      <p className="mt-3 text-zinc-400">
        View bookings and manage the business.
      </p>

      {/* Dashboard statistics */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-400">
                {card.label}
              </p>

              <span className="text-2xl">
                {card.icon}
              </span>
            </div>

            <p className="mt-6 text-4xl font-black text-white">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </section>

      {/* Booking calendar */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-2xl font-black">
              Booking Calendar
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Yellow dates have active appointments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
              aria-label="Previous month"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Today
            </button>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center border-b border-zinc-800 px-4 py-5">
          <h3 className="text-xl font-bold">
            {monthTitle}
          </h3>
        </div>

        <div className="grid grid-cols-7 border-b border-zinc-800 bg-black/40">
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
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

              <p className="mt-4 text-zinc-400">
                Loading calendar...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((calendarDay) => {
              const bookingCount =
                bookedDates[calendarDay.dateKey] || 0;

              const hasBookings = bookingCount > 0;
              const isToday = calendarDay.dateKey === todayKey;

              return (
                <div
                  key={calendarDay.dateKey}
                  className={`relative min-h-20 border-b border-r border-zinc-800 p-2 sm:min-h-28 sm:p-3 ${
                    calendarDay.currentMonth
                      ? "bg-zinc-950"
                      : "bg-black/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        isToday
                          ? "bg-white text-black"
                          : calendarDay.currentMonth
                            ? "text-white"
                            : "text-zinc-700"
                      }`}
                    >
                      {calendarDay.day}
                    </span>

                    {hasBookings && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-black text-black">
                        {bookingCount}
                      </span>
                    )}
                  </div>

                  {hasBookings && (
                    <div className="mt-2 rounded-md bg-yellow-400/10 px-1.5 py-1 text-center text-[9px] font-bold text-yellow-400 sm:text-xs">
                      {bookingCount}{" "}
                      {bookingCount === 1
                        ? "booking"
                        : "bookings"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}