"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Image as ImageIcon,
  Scissors,
  Users,
} from "lucide-react";
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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getStatusClasses(status) {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";
  }
}

function getTimeIndex(time) {
  const index = timeOrder.indexOf(time);

  return index === -1 ? timeOrder.length : index;
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

  return (
    getTimeIndex(firstBooking.time) -
    getTimeIndex(secondBooking.time)
  );
}

function StatCard({ label, value, description, icon: Icon, loading }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-[0_18px_50px_rgba(250,204,21,0.08)]">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-yellow-400/5 blur-2xl transition group-hover:bg-yellow-400/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-400">
            {label}
          </p>

          {loading ? (
            <div className="mt-5 h-11 w-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : (
            <p className="mt-4 text-4xl font-black tracking-tight text-white">
              {value}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 transition group-hover:scale-105 group-hover:bg-yellow-400 group-hover:text-black">
          <Icon size={23} />
        </div>
      </div>

      <p className="relative mt-4 text-sm text-zinc-500">
        {description}
      </p>
    </article>
  );
}

function BookingSkeleton() {
  return (
    <div className="space-y-5 p-5">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 rounded bg-zinc-800" />
              <div className="mt-3 h-3 w-24 rounded bg-zinc-800" />
            </div>

            <div className="h-6 w-20 rounded-full bg-zinc-800" />
          </div>

          <div className="mt-5 flex justify-between gap-4">
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="h-3 w-16 rounded bg-zinc-800" />
          </div>

          {item !== 4 && (
            <div className="mt-5 border-b border-zinc-800" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    totalServices: 0,
    totalGalleryImages: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const today = new Date();

  const todayKey = createDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

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

        const todayCount = bookingList.filter(
          (booking) =>
            booking.date === todayKey &&
            booking.status !== "cancelled"
        ).length;

        setBookings(bookingList);

        setStats({
          totalBookings: bookingList.length,
          todayBookings: todayCount,
          upcomingBookings: upcomingCount,
          totalServices: servicesSnapshot.size,
          totalGalleryImages: gallerySnapshot.size,
        });
      } catch (dashboardError) {
        console.error("Error loading dashboard:", dashboardError);

        setError(
          "Could not load the dashboard. Check your Firebase connection and permissions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [todayKey]);

  const cards = [
    {
      label: "Today’s Bookings",
      value: stats.todayBookings,
      description: "Active appointments scheduled for today.",
      icon: CalendarDays,
    },
    {
      label: "Upcoming Bookings",
      value: stats.upcomingBookings,
      description: "Appointments that still need to be completed.",
      icon: Clock3,
    },
    {
      label: "Services",
      value: stats.totalServices,
      description: "Services currently shown to customers.",
      icon: Scissors,
    },
    {
      label: "Gallery Images",
      value: stats.totalGalleryImages,
      description: "Photos currently displayed in the gallery.",
      icon: ImageIcon,
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

  const monthTitle = calendarDate.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const fullTodayDate = today.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
    <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8 xl:p-10">
      {/* Dashboard heading */}
      <section className="flex flex-col gap-6 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold uppercase tracking-[0.22em] text-yellow-400">
            Legacy Barbers
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
            {getGreeting()}
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Here is an overview of your bookings and website content.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Today
          </p>

          <p className="mt-1 font-bold text-white">
            {fullTodayDate}
          </p>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            {...card}
            loading={loading}
          />
        ))}
      </section>

      {/* Calendar and recent bookings */}
      <section className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.8fr)]">
        {/* Booking calendar */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-5 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-black text-white sm:text-2xl">
                Booking Calendar
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Dates highlighted in yellow have active bookings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Today
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center border-b border-zinc-800 bg-black/20 px-4 py-5">
            <h3 className="text-lg font-black text-white sm:text-xl">
              {monthTitle}
            </h3>
          </div>

          <div className="grid grid-cols-7 border-b border-zinc-800 bg-black/40">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-1 py-3 text-center text-[10px] font-black uppercase tracking-wider text-zinc-600 sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-20 animate-pulse border-b border-r border-zinc-800 p-2 sm:min-h-28 sm:p-3"
                >
                  <div className="h-7 w-7 rounded-full bg-zinc-800" />
                </div>
              ))}
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
                    className={`group relative min-h-20 border-b border-r border-zinc-800 p-2 transition sm:min-h-28 sm:p-3 ${
                      calendarDay.currentMonth
                        ? "bg-zinc-950 hover:bg-white/[0.025]"
                        : "bg-black/50"
                    } ${
                      hasBookings
                        ? "shadow-[inset_0_3px_0_rgba(250,204,21,0.9)]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition sm:text-sm ${
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
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-[10px] font-black text-black shadow-lg shadow-yellow-400/10">
                          {bookingCount}
                        </span>
                      )}
                    </div>

                    {hasBookings && (
                      <div className="mt-3 hidden rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2 py-2 text-center sm:block">
                        <p className="text-[11px] font-black text-yellow-400">
                          {bookingCount}{" "}
                          {bookingCount === 1
                            ? "booking"
                            : "bookings"}
                        </p>
                      </div>
                    )}

                    {hasBookings && (
                      <div className="mx-auto mt-2 h-1.5 w-1.5 rounded-full bg-yellow-400 sm:hidden" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <aside className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-black text-white">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your next five appointments.
              </p>
            </div>

            <Link
              href="/admin/bookings"
              className="shrink-0 text-sm font-black text-yellow-400 transition hover:text-yellow-300"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <BookingSkeleton />
          ) : recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500">
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-5 text-lg font-black text-white">
                No appointments booked
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                New customer bookings will appear here when they are
                submitted.
              </p>

              <Link
                href="/book"
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                View Booking Page
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="group p-5 transition duration-200 hover:bg-white/[0.025] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-black text-zinc-500 transition group-hover:border-yellow-400/30 group-hover:text-yellow-400">
                        <Users size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black text-white">
                          {booking.name || "Unknown customer"}
                        </h3>

                        <p className="mt-1 truncate text-sm font-semibold text-yellow-400">
                          {booking.service || "No service selected"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      {booking.status || "upcoming"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-zinc-200">
                        {formatBookingDate(booking.date)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-bold text-zinc-200">
                        {booking.time || "No time"}
                      </p>
                    </div>
                  </div>

                  {booking.phone && (
                    <a
                      href={`tel:${booking.phone}`}
                      className="mt-4 inline-block text-xs font-semibold text-zinc-500 transition hover:text-yellow-400"
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
              className="block rounded-xl bg-yellow-400 px-4 py-3.5 text-center text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Manage All Bookings
            </Link>
          </div>
        </aside>
      </section>

      <p className="mt-8 text-center text-xs text-zinc-700">
        Total bookings recorded: {loading ? "..." : stats.totalBookings}
      </p>
    </main>
  );
}