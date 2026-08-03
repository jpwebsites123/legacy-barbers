"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import BookingForm from "../../components/BookingForm";
import { db } from "../../lib/firebase";
import { siteConfig } from "../../lib/siteConfig";

const BUSINESS_TIME_ZONE = "America/Toronto";

function getCurrentBookingMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date());
}

const defaultSettings = {
  bookingsOpen: siteConfig.booking?.bookingsOpen ?? true,
  bookingOpenDate: siteConfig.booking?.bookingOpenDate || "",
  bookingOpenTime: siteConfig.booking?.bookingOpenTime || "10:00",
};

function formatTime(time) {
  if (!time || typeof time !== "string") {
    return "10:00 AM";
  }

  const [hours = "", minutes = "00"] = time.split(":");
  const hourNumber = Number(hours);

  if (
    Number.isNaN(hourNumber) ||
    hourNumber < 0 ||
    hourNumber > 23
  ) {
    return time;
  }

  const period = hourNumber >= 12 ? "PM" : "AM";
  const formattedHour = hourNumber % 12 || 12;

  return `${formattedHour}:${minutes || "00"} ${period}`;
}

function formatDate(date) {
  if (!date || typeof date !== "string") {
    return "";
  }

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
}

export default function BookPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  const bookingPage = siteConfig.bookingPage;

  const bookingMonth = useMemo(() => {
    return getCurrentBookingMonth();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        setSettingsError("");

        const settingsReference = doc(db, "settings", "business");
        const settingsSnapshot = await getDoc(settingsReference);

        if (!isMounted) {
          return;
        }

        if (settingsSnapshot.exists()) {
          const firebaseSettings = settingsSnapshot.data();

          setSettings({
            bookingsOpen:
              typeof firebaseSettings.bookingsOpen === "boolean"
                ? firebaseSettings.bookingsOpen
                : defaultSettings.bookingsOpen,

            bookingOpenDate:
              typeof firebaseSettings.bookingOpenDate === "string"
                ? firebaseSettings.bookingOpenDate
                : defaultSettings.bookingOpenDate,

            bookingOpenTime:
              typeof firebaseSettings.bookingOpenTime === "string"
                ? firebaseSettings.bookingOpenTime
                : defaultSettings.bookingOpenTime,
          });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Error loading booking settings:", error);

        if (isMounted) {
          setSettings(defaultSettings);
          setSettingsError(
            "We could not load the latest booking information."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSettings(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    bookingsOpen,
    bookingOpenDate,
    bookingOpenTime,
  } = settings;

  const formattedOpenTime = formatTime(bookingOpenTime);
  const formattedOpenDate = formatDate(bookingOpenDate);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Hero */}
      <section className="section-spacing text-center">
        <div className="section-container">
          <p className="fade-up text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
            {siteConfig.businessName}
          </p>

          <h1 className="section-title fade-up-delay-1 mx-auto mt-5 max-w-3xl">
            {bookingPage.title}
          </h1>

          <p className="section-description fade-up-delay-2 mx-auto">
            {bookingPage.description}
          </p>
        </div>
      </section>

      {/* Booking Content */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-container grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.7fr] lg:gap-8">
          {/* Left Column */}
          <div className="w-full min-w-0 space-y-5 sm:space-y-6">
            {/* Current Booking Month */}
            <div className="premium-card fade-up w-full p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.25em]">
                {bookingPage.currentMonthLabel}
              </p>

              {loadingSettings ? (
                <div className="mt-4">
                  <div className="loading-skeleton h-9 w-40 rounded-lg" />
                  <div className="loading-skeleton mt-5 h-5 w-36 rounded-lg" />
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    {bookingMonth}
                  </h2>

                  <div className="mt-4 flex items-center gap-3 sm:mt-5">
                    <span
                      className={`glow h-3 w-3 shrink-0 rounded-full ${
                        bookingsOpen ? "bg-green-500" : "bg-red-500"
                      }`}
                    />

                    <p
                      className={`text-sm font-bold sm:text-base ${
                        bookingsOpen
                          ? "text-green-400"
                          : "text-red-400"
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
            <div className="premium-card fade-up w-full p-5 sm:p-7">
              <h2 className="text-2xl font-bold">
                {bookingPage.beforeBookingTitle}
              </h2>

              <div className="mt-6 space-y-5">
                {bookingPage.tips.map((tip) => (
                  <div
                    key={tip.number}
                    className="fade-up flex min-w-0 gap-3 sm:gap-4"
                  >
                    <span className="shrink-0 text-lg font-bold text-yellow-400 sm:text-xl">
                      {tip.number}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold sm:text-lg">
                        {tip.title}
                      </h3>

                      <p className="mt-1 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="premium-card fade-up w-full min-w-0 max-w-full overflow-hidden p-4 shadow-2xl sm:p-8">
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
                    {bookingPage.bookingFormTitle}
                  </h2>

                  <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                    {bookingPage.bookingFormDescription}{" "}
                    <span className="font-semibold text-white">
                      {bookingMonth}
                    </span>
                    .
                  </p>
                </div>

                <BookingForm bookingMonth={bookingMonth} />
              </>
            ) : (
              <div className="py-12 text-center sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 sm:h-20 sm:w-20">
                  <span className="text-3xl sm:text-4xl">✂️</span>
                </div>

                <h2 className="mt-6 text-3xl font-black text-red-400 sm:mt-7 sm:text-4xl">
                  {bookingPage.closedTitle}
                </h2>

                <p className="mx-auto mt-4 max-w-xl break-words text-sm text-zinc-400 sm:mt-5 sm:text-base">
                  {bookingPage.closedDescription}
                </p>

                {(formattedOpenDate || formattedOpenTime) && (
                  <p className="mt-4 break-words text-sm font-semibold text-white sm:text-base">
                    {formattedOpenDate
                      ? `Bookings open on ${formattedOpenDate} at ${formattedOpenTime}.`
                      : `Bookings open at ${formattedOpenTime}.`}
                  </p>
                )}

                <Link
                  href="/contact"
                  className="premium-button mt-8 sm:mt-9 sm:px-8 sm:py-4"
                >
                  {bookingPage.contactButton}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent" />

        <div className="section-spacing relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Need Help Booking?
            </p>

            <h2 className="section-title mt-5">
              {bookingPage.bottomTitle}
            </h2>

            <p className="section-description mx-auto max-w-2xl">
              {bookingPage.bottomDescription}
            </p>

            <Link
              href="/contact"
              className="premium-outline-button mt-8 sm:mt-10"
            >
              {bookingPage.bottomButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}