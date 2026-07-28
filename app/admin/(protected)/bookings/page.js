"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  LoaderCircle,
  Phone,
  RotateCcw,
  Scissors,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

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

const statusOptions = [
  {
    value: "all",
    label: "All Bookings",
  },
  {
    value: "upcoming",
    label: "Upcoming",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

function createDateKey(year, month, day) {
  const formattedMonth = String(month + 1).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date selected";
  }

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
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

function getStatusIcon(status) {
  switch (status) {
    case "completed":
      return CheckCircle2;

    case "cancelled":
      return XCircle;

    default:
      return Clock3;
  }
}

function getSafeTimeIndex(time) {
  const timeIndex = timeOrder.indexOf(time);

  return timeIndex === -1 ? timeOrder.length : timeIndex;
}

function sortBookings(firstBooking, secondBooking) {
  const firstDate = firstBooking.date || "9999-12-31";
  const secondDate = secondBooking.date || "9999-12-31";

  const dateComparison = firstDate.localeCompare(secondDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return (
    getSafeTimeIndex(firstBooking.time) -
    getSafeTimeIndex(secondBooking.time)
  );
}

function DashboardCard({
  label,
  amount,
  description,
  icon: Icon,
  selected,
  onClick,
  loading,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] ${
        selected
          ? "border-yellow-400/50 bg-yellow-400/10"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
      }`}
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition ${
          selected
            ? "bg-yellow-400/15"
            : "bg-white/[0.03] group-hover:bg-yellow-400/10"
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-bold ${
              selected ? "text-yellow-400" : "text-zinc-400"
            }`}
          >
            {label}
          </p>

          {loading ? (
            <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-zinc-800" />
          ) : (
            <p className="mt-3 text-3xl font-black tracking-tight text-white">
              {amount}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
            selected
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-zinc-800 bg-black text-zinc-500 group-hover:border-yellow-400/30 group-hover:text-yellow-400"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="relative mt-3 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </button>
  );
}

function BookingSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4].map((item) => (
        <article
          key={item}
          className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-800" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-5 w-36 rounded bg-zinc-800" />
                  <div className="h-6 w-20 rounded-full bg-zinc-800" />
                </div>

                <div className="mt-3 h-4 w-52 rounded bg-zinc-800" />

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="h-20 rounded-2xl bg-zinc-900" />
                  <div className="h-20 rounded-2xl bg-zinc-900" />
                  <div className="h-20 rounded-2xl bg-zinc-900" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-64">
              <div className="h-11 rounded-xl bg-zinc-800" />
              <div className="h-11 rounded-xl bg-zinc-800" />
              <div className="h-11 rounded-xl bg-zinc-800" />
              <div className="h-11 rounded-xl bg-zinc-800" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function DeleteConfirmationModal({
  booking,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close delete confirmation"
        onClick={onCancel}
        disabled={deleting}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-booking-title"
        className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black sm:p-7"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={deleting}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
          <Trash2 size={25} />
        </div>

        <h2
          id="delete-booking-title"
          className="mt-5 text-2xl font-black text-white"
        >
          Delete this booking?
        </h2>

        <p className="mt-3 leading-7 text-zinc-400">
          You are about to permanently delete the booking for{" "}
          <span className="font-bold text-white">
            {booking.name || "this customer"}
          </span>
          . This cannot be undone.
        </p>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/50 p-4">
          <p className="font-bold text-white">
            {booking.service || "No service"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(booking.date)} at {booking.time || "No time"}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep Booking
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Deleting
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const today = new Date();

  const todayKey = createDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  useEffect(() => {
    setLoading(true);
    setError("");

    const bookingsQuery = query(
      collection(db, "bookings"),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loadedBookings = snapshot.docs
          .map((bookingDocument) => {
            const bookingData = bookingDocument.data();

            return {
              id: bookingDocument.id,
              ...bookingData,
              status: bookingData.status || "upcoming",
            };
          })
          .sort(sortBookings);

        setBookings(loadedBookings);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Error loading bookings:", snapshotError);

        setError(
          "Could not load bookings. Check your Firebase connection and security rules."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [message]);

  const totals = useMemo(() => {
    return {
      all: bookings.length,
      upcoming: bookings.filter(
        (booking) => booking.status === "upcoming"
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "completed"
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === "cancelled"
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingName = booking.name?.toLowerCase() || "";
      const bookingPhone = booking.phone?.toLowerCase() || "";
      const bookingService = booking.service?.toLowerCase() || "";
      const bookingDate = booking.date || "";

      const matchesSearch =
        !searchText ||
        bookingName.includes(searchText) ||
        bookingPhone.includes(searchText) ||
        bookingService.includes(searchText) ||
        bookingDate.includes(searchText);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesDate =
        !dateFilter || booking.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    Boolean(dateFilter);

  async function changeStatus(bookingId, newStatus) {
    if (changingId) {
      return;
    }

    setChangingId(bookingId);
    setMessage("");
    setError("");

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
      });

      setMessage(`Booking marked as ${newStatus}.`);
    } catch (updateError) {
      console.error("Error updating booking:", updateError);

      setError(
        "Could not update this booking. Check your Firebase security rules."
      );
    } finally {
      setChangingId("");
    }
  }

  function requestDeleteBooking(booking) {
    if (changingId) {
      return;
    }

    setBookingToDelete(booking);
    setMessage("");
    setError("");
  }

  async function confirmDeleteBooking() {
    if (!bookingToDelete || changingId) {
      return;
    }

    const bookingId = bookingToDelete.id;

    setChangingId(bookingId);
    setMessage("");
    setError("");

    try {
      await deleteDoc(doc(db, "bookings", bookingId));

      setBookingToDelete(null);
      setMessage("Booking deleted.");
    } catch (deleteError) {
      console.error("Error deleting booking:", deleteError);

      setError(
        "Could not delete this booking. Check your Firebase security rules."
      );
    } finally {
      setChangingId("");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("");
  }

  const dashboardCards = [
    {
      value: "all",
      label: "All Bookings",
      amount: totals.all,
      description: "Every appointment in the system.",
      icon: CalendarDays,
    },
    {
      value: "upcoming",
      label: "Upcoming",
      amount: totals.upcoming,
      description: "Appointments waiting to be completed.",
      icon: Clock3,
    },
    {
      value: "completed",
      label: "Completed",
      amount: totals.completed,
      description: "Appointments successfully finished.",
      icon: CheckCircle2,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      amount: totals.cancelled,
      description: "Appointments that were cancelled.",
      icon: XCircle,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8 xl:p-10">
      <DeleteConfirmationModal
        booking={bookingToDelete}
        deleting={
          Boolean(bookingToDelete) &&
          changingId === bookingToDelete.id
        }
        onCancel={() => {
          if (!changingId) {
            setBookingToDelete(null);
          }
        }}
        onConfirm={confirmDeleteBooking}
      />

      <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold uppercase tracking-[0.22em] text-yellow-400">
            Legacy Barbers
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
              Bookings
            </h1>

            {!loading && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm font-black text-zinc-400">
                {bookings.length}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-2xl text-zinc-400">
            View customer details and manage every appointment from one
            place.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Today
            </p>

            <p className="mt-1 font-bold text-white">
              {today.toLocaleDateString("en-CA", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.value}
            {...card}
            loading={loading}
            selected={statusFilter === card.value}
            onClick={() => setStatusFilter(card.value)}
          />
        ))}
      </section>

      <section className="sticky top-16 z-30 mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:top-0 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(200px,0.55fr)_minmax(200px,0.55fr)_auto]">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Search
            </span>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="search"
                placeholder="Search name, phone, service or date"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-black py-3.5 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-900 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Status
            </span>

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-zinc-700 bg-black py-3.5 pl-11 pr-10 text-sm font-semibold text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Date
            </span>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-black py-3.5 pl-11 pr-4 text-sm font-semibold text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3.5 text-sm font-bold text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-35 xl:w-auto"
            >
              <RotateCcw size={17} />
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">
            Showing{" "}
            <span className="font-black text-white">
              {loading ? "..." : filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-white">
              {loading ? "..." : bookings.length}
            </span>{" "}
            bookings
          </p>

          {dateFilter === todayKey && (
            <span className="font-bold text-yellow-400">
              Viewing today&apos;s appointments
            </span>
          )}
        </div>
      </section>

      {message && (
        <div
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-semibold text-emerald-400"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400"
        >
          <XCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section className="mt-8">
        {loading ? (
          <BookingSkeleton />
        ) : filteredBookings.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
              <Search size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              No bookings found
            </h2>

            <p className="mt-3 text-zinc-400">
              Try changing your search or filters to find what you're looking
              for.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);
              const isChanging = changingId === booking.id;

              return (
                <article
                  key={booking.id}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                >
                  <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-950 to-zinc-900 p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
                          {getInitials(booking.name)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="truncate text-2xl font-black text-white">
                              {booking.name || "Unknown Customer"}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClasses(
                                booking.status
                              )}`}
                            >
                              <StatusIcon size={14} />
                              {booking.status}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-zinc-500">
                            Customer Appointment
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:w-64">
                        <button
                          type="button"
                          disabled={
                            isChanging ||
                            booking.status === "completed"
                          }
                          onClick={() =>
                            changeStatus(
                              booking.id,
                              "completed"
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isChanging &&
                          booking.status !== "completed" ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={16} />
                          )}
                          Complete
                        </button>

                        <button
                          type="button"
                          disabled={
                            isChanging ||
                            booking.status === "cancelled"
                          }
                          onClick={() =>
                            changeStatus(
                              booking.id,
                              "cancelled"
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <X size={16} />
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            isChanging ||
                            booking.status === "upcoming"
                          }
                          onClick={() =>
                            changeStatus(
                              booking.id,
                              "upcoming"
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-black text-white transition hover:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw size={16} />
                          Upcoming
                        </button>

                        <button
                          type="button"
                          disabled={isChanging}
                          onClick={() =>
                            requestDeleteBooking(booking)
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <CalendarDays size={17} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Date
                        </span>
                      </div>

                      <p className="mt-3 font-bold text-white">
                        {formatDate(booking.date)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Clock3 size={17} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Time
                        </span>
                      </div>

                      <p className="mt-3 font-bold text-white">
                        {booking.time || "No time"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Scissors size={17} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Service
                        </span>
                      </div>

                      <p className="mt-3 font-bold text-white">
                        {booking.service || "No service"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Phone size={17} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Phone
                        </span>
                      </div>

                      {booking.phone ? (
                        <a
                          href={`tel:${booking.phone}`}
                          className="mt-3 block font-bold text-white transition hover:text-yellow-400"
                        >
                          {booking.phone}
                        </a>
                      ) : (
                        <p className="mt-3 font-bold text-zinc-500">
                          No phone number
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}