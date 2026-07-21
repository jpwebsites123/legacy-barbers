"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import BookingForm from "../../components/BookingForm";
import { db } from "../../lib/firebase";

const defaultSettings = {
  bookingMonth: "July 2026",
  bookingsOpen: true,
  bookingOpenDate: "",
  bookingOpenTime: "10:00",
};

function formatTime(time) {
  if (!time) return "10:00 AM";

  const [hours, minutes] = time.split(":");
  const hourNumber = Number(hours);

  if (Number.isNaN(hourNumber)) {
    return time;
  }

  const period = hourNumber >= 12 ? "PM" : "AM";
  const formattedHour = hourNumber % 12 || 12;

  return `${formattedHour}:${minutes || "00"} ${period}`;
}

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Book() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsReference = doc(db, "settings", "business");
        const settingsSnapshot = await getDoc(settingsReference);

        if (settingsSnapshot.exists()) {
          setSettings({
            ...defaultSettings,
            ...settingsSnapshot.data(),
          });
        }
      } catch (error) {
        console.error("Error loading booking settings:", error);
        setSettingsError(
          "We could not load the latest booking information."
        );
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  const {
    bookingsOpen,
    bookingMonth,
    bookingOpenDate,
    bookingOpenTime,
  } = settings;

  const formattedOpenTime = formatTime(bookingOpenTime);
  const formattedOpenDate = formatDate(bookingOpenDate);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Hero */}
      <section className="px-4 pb-10 pt-28 text-center sm:px-6 sm:pb-14 sm:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
          Legacy Barbers
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight sm:mt-5 sm:text-5xl md:text-6xl">
          Book Your Appointment
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
          Choose your service, date, and preferred time. Bookings open on the
          first day of each month and stay open until all appointments are
          filled.
        </p>
      </section>

      {/* Booking Content */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_1.7fr] lg:gap-8">
          {/* Left Column */}
          <div className="w-full min-w-0 space-y-5 sm:space-y-6">
            {/* Current Month */}
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.25em]">
                Current Booking Month
              </p>

              {loadingSettings ? (
                <div className="mt-4">
                  <div className="h-9 w-40 animate-pulse rounded-lg bg-zinc-800" />
                  <div className="mt-5 h-5 w-36 animate-pulse rounded-lg bg-zinc-800" />
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    {bookingMonth}
                  </h2>

                  <div className="mt-4 flex items-center gap-3 sm:mt-5">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        bookingsOpen ? "bg-green-500" : "bg-red-500"
                      }`}
                    />

                    <p
                      className={`text-sm font-bold sm:text-base ${
                        bookingsOpen ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {bookingsOpen
                        ? "Bookings Are Open"
                        : "Bookings Are Closed"}
                    </p>
                  </div>
                </>
              )}

              {settingsError && (
                <p className="mt-4 text-sm leading-relaxed text-yellow-400">
                  {settingsError} Showing the default booking information.
                </p>
              )}
            </div>

            {/* Before You Book */}
            <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-7">
              <h2 className="text-2xl font-bold">Before You Book</h2>

              <div className="mt-6 space-y-5">
                {[
                  [
                    "01",
                    "Arrive On Time",
                    "Please arrive a few minutes before your appointment.",
                  ],
                  [
                    "02",
                    "Choose Carefully",
                    "Select the correct service so enough time is reserved.",
                  ],
                  [
                    "03",
                    "Need Help?",
                    "Contact us before booking if you have questions.",
                  ],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex min-w-0 gap-3 sm:gap-4">
                    <span className="shrink-0 text-lg font-bold text-yellow-400 sm:text-xl">
                      {number}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold sm:text-lg">
                        {title}
                      </h3>

                      <p className="mt-1 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:rounded-3xl sm:p-8">
            {loadingSettings ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

                  <p className="mt-4 text-zinc-400">
                    Loading booking information...
                  </p>
                </div>
              </div>
            ) : bookingsOpen ? (
              <>
                <div className="mb-6 min-w-0 sm:mb-8">
                  <h2 className="break-words text-2xl font-black sm:text-3xl">
                    Select Your Appointment
                  </h2>

                  <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                    Complete the form below to reserve your spot for{" "}
                    <span className="font-semibold text-white">
                      {bookingMonth}
                    </span>
                    .
                  </p>
                </div>

                <BookingForm />
              </>
            ) : (
              <div className="py-12 text-center sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 sm:h-20 sm:w-20">
                  <span className="text-3xl sm:text-4xl">✂️</span>
                </div>

                <h2 className="mt-6 text-3xl font-black text-red-400 sm:mt-7 sm:text-4xl">
                  Bookings Closed
                </h2>

                <p className="mx-auto mt-4 max-w-xl break-words text-sm text-zinc-400 sm:mt-5 sm:text-base">
                  Appointments for {bookingMonth} are not currently available.
                </p>

                {(formattedOpenDate || formattedOpenTime) && (
                  <p className="mt-4 break-words text-sm font-semibold text-white sm:text-base">
                    {formattedOpenDate
                      ? `Bookings open on ${formattedOpenDate} at ${formattedOpenTime}.`
                      : `Bookings open at ${formattedOpenTime}.`}
                  </p>
                )}

                <a
                  href="/contact"
                  className="mt-8 inline-block rounded-xl bg-yellow-400 px-7 py-3 font-bold text-black transition hover:bg-yellow-300 sm:mt-9 sm:px-8 sm:py-4"
                >
                  Contact Us
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="break-words text-3xl font-black md:text-4xl">
            Questions Before Booking?
          </h2>

          <p className="mt-4 break-words text-base text-zinc-400 sm:mt-5 sm:text-lg">
            Contact us and we will help you choose the right service.
          </p>

          <a
            href="/contact"
            className="mt-7 inline-block max-w-full rounded-xl border border-yellow-400 px-6 py-3 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black sm:mt-8 sm:px-8"
          >
            Contact Legacy Barbers
          </a>
        </div>
      </section>
    </main>
  );
}