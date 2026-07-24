"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeOrder = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

function createDateKey(year, month, day) {
  const formattedMonth = String(month + 1).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;
}

function formatBookingDate(dateString) {
  if (!dateString) {
    return "No date";
  }

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "completed":
      return "border-green-500/30 bg-green-500/10 text-green-400";

    case "cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }
}

function sortBookings(firstBooking, secondBooking) {
  const statusOrder = {
    upcoming: 0,
    completed: 1,
    cancelled: 2,
  };

  const firstStatus =
    statusOrder[firstBooking.status || "upcoming"] ?? 3;

  const secondStatus =
    statusOrder[secondBooking.status || "upcoming"] ?? 3;

  if (firstStatus !== secondStatus) {
    return firstStatus - secondStatus;
  }

  const firstDate = firstBooking.date || "9999-12-31";
  const secondDate = secondBooking.date || "9999-12-31";

  const dateComparison = firstDate.localeCompare(secondDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  const firstTimeIndex = timeOrder.indexOf(firstBooking.time);
  const secondTimeIndex = timeOrder.indexOf(secondBooking.time);

  const safeFirstTime =
    firstTimeIndex === -1 ? timeOrder.length : firstTimeIndex;

  const safeSecondTime =
    secondTimeIndex === -1 ? timeOrder.length : secondTimeIndex;

  return safeFirstTime - safeSecondTime;
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
  const [error, setError] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          bookingsSnapshot,
          servicesSnapshot,
          gallerySnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "services")),
          getDocs(collection(db, "gallery")),
        ]);

        const bookingList = bookingsSnapshot.docs.map(
          (bookingDocument) => {
            const bookingData = bookingDocument.data();

            return {
              id: bookingDocument.id,
              ...bookingData,
              status: bookingData.status || "upcoming",
            };
          }
        );

        const upcomingCount = bookingList.filter(
          (booking) => booking.status === "upcoming"
        ).length;

        setBookings(bookingList);

        setStats({
          totalBookings: bookingList.length,
          upcomingBookings: upcomingCount,
          totalServices: servicesSnapshot.size,
          totalGalleryImages: gallerySnapshot.size,
        });
      } catch (dashboardError) {
        console.error(
          "Error loading dashboard:",
          dashboardError
        );

        setError(
          "Could not load the dashboard. Check your Firebase permissions."
        );
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

  const recentBookings = useMemo(() => {
    return [...bookings].sort(sortBookings).slice(0, 5);
  }, [bookings]);

  const bookedDates = useMemo(() => {
    const dateCounts = {};

    bookings.forEach((booking) => {
      if (!booking.date || booking.status === "cancelled") {
        return;
      }

      dateCounts[booking.date] =
        (dateCounts[booking.date] || 0) + 1;
    });

    return dateCounts;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const numberOfDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const days = [];

    for (
      let index = firstDayOfMonth - 1;
      index >= 0;
      index -= 1
    ) {
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
      const nextDate = new Date(
        year,
        month + 1,
        nextMonthDay
      );

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

  const monthTitle = calendarDate.toLocaleDateString(
    "en-CA",
    {
      month: "long",
      year: "numeric",
    }
  );

  function previousMonth() {
    setCalendarDate((currentDate) => {
      return new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
    });
  }

  function nextMonth() {
    setCalendarDate((currentDate) => {
      return new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    });
  }

  function goToToday() {
    setCalendarDate(new Date());
  }

  return (
    <main className="p-5 sm:p-8">
      <p className="font-semibold uppercase tracking-[0.2em] text-yellow-400">
        Legacy Barbers
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Dashboard
      </h1>

      <p className="mt-3 text-zinc-400">
        View bookings and manage the business.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400">
          {error}
        </p>
      )}

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

              <span className="text-2xl">{card.icon}</span>
            </div>

            <p className="mt-6 text-4xl font-black text-white">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </section>

      {/* Calendar and recent bookings */}
      <section className="mt-10 grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Booking calendar */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
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
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
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
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
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

                const isToday =
                  calendarDay.dateKey === todayKey;

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
        </div>

        {/* Recent bookings */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 p-5">
            <div>
              <h2 className="text-xl font-black">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Your next five appointments.
              </p>
            </div>

            <Link
              href="/admin/bookings"
              className="text-sm font-bold text-yellow-400 transition hover:text-yellow-300"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

              <p className="mt-4 text-sm text-zinc-400">
                Loading bookings...
              </p>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl">📅</div>

              <h3 className="mt-4 font-bold">
                No bookings yet
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                New customer bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="p-5 transition hover:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">
                        {booking.name || "Unknown customer"}
                      </h3>

                      <p className="mt-1 truncate text-sm font-semibold text-yellow-400">
                        {booking.service || "No service"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      {booking.status || "upcoming"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <p className="text-zinc-300">
                      {formatBookingDate(booking.date)}
                    </p>

                    <p className="font-bold text-white">
                      {booking.time || "No time"}
                    </p>
                  </div>

                  {booking.phone && (
                    <a
                      href={`tel:${booking.phone}`}
                      className="mt-3 inline-block text-xs text-zinc-500 transition hover:text-yellow-400"
                    >
                      {booking.phone}
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className="border-t border-zinc-800 p-4">
            <Link
              href="/admin/bookings"
              className="block rounded-xl bg-yellow-400 px-4 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Manage All Bookings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}