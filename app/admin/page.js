"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

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

function formatDate(dateString) {
  if (!dateString) return "No date";

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    weekday: "short",
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

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check whether the visitor is signed in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setCheckingAuth(false);
        router.replace("/admin/login");
        return;
      }

      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Only load bookings after the admin has signed in.
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const bookingsQuery = query(
      collection(db, "bookings"),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loadedBookings = snapshot.docs.map((bookingDocument) => {
          const bookingData = bookingDocument.data();

          return {
            id: bookingDocument.id,
            ...bookingData,
            status: bookingData.status || "upcoming",
          };
        });

        loadedBookings.sort((a, b) => {
          const firstDate = a.date || "";
          const secondDate = b.date || "";
          const dateComparison = firstDate.localeCompare(secondDate);

          if (dateComparison !== 0) {
            return dateComparison;
          }

          const firstTimeIndex = timeOrder.indexOf(a.time);
          const secondTimeIndex = timeOrder.indexOf(b.time);

          return firstTimeIndex - secondTimeIndex;
        });

        setBookings(loadedBookings);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Error loading bookings:", snapshotError);

        setError(
          "Could not load bookings. Check your Firebase security rules."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredBookings = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingName = booking.name?.toLowerCase() || "";
      const bookingPhone = booking.phone?.toLowerCase() || "";
      const bookingService = booking.service?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        bookingName.includes(searchText) ||
        bookingPhone.includes(searchText) ||
        bookingService.includes(searchText);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

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

  async function changeStatus(bookingId, newStatus) {
    if (!user || changingId) return;

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

  async function removeBooking(bookingId, customerName) {
    if (!user || changingId) return;

    const confirmed = window.confirm(
      `Delete ${customerName}'s booking? This cannot be undone.`
    );

    if (!confirmed) return;

    setChangingId(bookingId);
    setMessage("");
    setError("");

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
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

  async function logout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setMessage("");
    setError("");

    try {
      await signOut(auth);
      router.replace("/admin/login");
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
      setError("Could not log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-32">
        <p className="text-zinc-400">Checking admin access...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-32">
        <p className="text-zinc-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-12 pt-32 sm:px-6">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Legacy Barbers
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Admin Bookings
          </h1>

          <p className="mt-2 text-zinc-400">
            View and manage customer appointments.
          </p>

          <p className="mt-2 break-all text-sm text-zinc-500">
            Signed in as {user.email}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full rounded-xl border border-zinc-700 px-5 py-3 font-bold transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isLoggingOut ? "Logging Out..." : "Log Out"}
        </button>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardCard label="All" amount={totals.all} />
        <DashboardCard label="Upcoming" amount={totals.upcoming} />
        <DashboardCard label="Completed" amount={totals.completed} />
        <DashboardCard label="Cancelled" amount={totals.cancelled} />
      </section>

      <section className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Search bookings</span>

          <input
            type="search"
            placeholder="Name, phone or service"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">Filter by status</span>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
          >
            <option value="all">All bookings</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </section>

      {message && (
        <p
          aria-live="polite"
          className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 font-semibold text-green-400"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          aria-live="polite"
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400"
        >
          {error}
        </p>
      )}

      <section className="mt-8">
        {loading && <p className="text-zinc-400">Loading bookings...</p>}

        {!loading && filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-xl font-bold">No bookings found</h2>

            <p className="mt-2 text-zinc-400">
              Try changing your search or filter.
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const isChanging = changingId === booking.id;

            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">
                        {booking.name || "Unknown customer"}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-yellow-400">
                      {formatDate(booking.date)} at{" "}
                      {booking.time || "No time"}
                    </p>

                    <div className="mt-4 grid gap-1 text-zinc-300">
                      <p>
                        <span className="font-semibold text-white">
                          Service:
                        </span>{" "}
                        {booking.service || "No service"}
                      </p>

                      <p>
                        <span className="font-semibold text-white">
                          Phone:
                        </span>{" "}
                        {booking.phone ? (
                          <a
                            href={`tel:${booking.phone}`}
                            className="hover:text-yellow-400"
                          >
                            {booking.phone}
                          </a>
                        ) : (
                          "No phone number"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:w-64">
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(booking.id, "completed")
                      }
                      disabled={
                        isChanging || booking.status === "completed"
                      }
                      className="rounded-xl bg-green-500 px-3 py-3 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Complete
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(booking.id, "cancelled")
                      }
                      disabled={
                        isChanging || booking.status === "cancelled"
                      }
                      className="rounded-xl bg-yellow-400 px-3 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(booking.id, "upcoming")
                      }
                      disabled={
                        isChanging || booking.status === "upcoming"
                      }
                      className="rounded-xl border border-zinc-600 px-3 py-3 text-sm font-bold transition hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Upcoming
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeBooking(
                          booking.id,
                          booking.name || "this customer"
                        )
                      }
                      disabled={isChanging}
                      className="rounded-xl bg-red-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function DashboardCard({ label, amount }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{amount}</p>
    </div>
  );
}