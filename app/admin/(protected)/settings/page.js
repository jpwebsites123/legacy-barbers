"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

const defaultSettings = {
  businessName: "Legacy Barbers",
  bookingMonth: "July 2026",
  bookingsOpen: true,
  phone: "",
  email: "",
  address: "",
  bookingOpenDate: "",
  bookingOpenTime: "10:00",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      } catch (loadError) {
        console.error("Error loading settings:", loadError);
        setError("Could not load the business settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveSettings(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await setDoc(doc(db, "settings", "business"), settings, {
        merge: true,
      });

      setMessage("Business settings saved.");
    } catch (saveError) {
      console.error("Error saving settings:", saveError);
      setError(
        "Could not save the settings. Check your Firestore security rules."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-zinc-400">Loading business settings...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-400">
          Legacy Barbers
        </p>

        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          Business Settings
        </h1>

        <p className="mt-3 text-zinc-400">
          Manage the booking month and business information.
        </p>
      </div>

      {message && (
        <p className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 font-semibold text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400">
          {error}
        </p>
      )}

      <form
        onSubmit={saveSettings}
        className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8"
      >
        <section>
          <h2 className="text-xl font-bold">Booking Settings</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Booking Month</span>

              <input
                type="text"
                name="bookingMonth"
                value={settings.bookingMonth}
                onChange={updateField}
                placeholder="July 2026"
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Booking Open Time</span>

              <input
                type="time"
                name="bookingOpenTime"
                value={settings.bookingOpenTime}
                onChange={updateField}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Booking Open Date</span>

              <input
                type="date"
                name="bookingOpenDate"
                value={settings.bookingOpenDate}
                onChange={updateField}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-black px-4 py-3">
              <input
                type="checkbox"
                name="bookingsOpen"
                checked={settings.bookingsOpen}
                onChange={updateField}
                className="h-5 w-5 accent-yellow-400"
              />

              <span className="font-semibold">
                Bookings are currently open
              </span>
            </label>
          </div>
        </section>

        <section className="border-t border-zinc-800 pt-6">
          <h2 className="text-xl font-bold">Business Information</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Business Name</span>

              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={updateField}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Phone</span>

              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={updateField}
                placeholder="905-555-1234"
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Email</span>

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={updateField}
                placeholder="info@legacybarbers.com"
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Address</span>

              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={updateField}
                placeholder="Hamilton, Ontario"
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </main>
  );
}