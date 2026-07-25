"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

const defaultBusinessHours = {
  0: {
    name: "Sunday",
    closed: true,
    open: "10:00",
    close: "17:00",
  },
  1: {
    name: "Monday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  2: {
    name: "Tuesday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  3: {
    name: "Wednesday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  4: {
    name: "Thursday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  5: {
    name: "Friday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
  6: {
    name: "Saturday",
    closed: false,
    open: "10:00",
    close: "17:00",
  },
};

const defaultSettings = {
  businessName: "Legacy Barbers",
  bookingsOpen: true,
  appointmentDuration: 60,
  phone: "",
  email: "",
  address: "",
  businessHours: defaultBusinessHours,
  closedDates: [],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsReference = doc(
          db,
          "settings",
          "business"
        );

        const settingsSnapshot = await getDoc(
          settingsReference
        );

        if (settingsSnapshot.exists()) {
          const savedSettings = settingsSnapshot.data();

          setSettings({
            ...defaultSettings,
            ...savedSettings,
            appointmentDuration: [30, 45, 60].includes(
  Number(savedSettings.appointmentDuration)
)
  ? Number(savedSettings.appointmentDuration)
  : 60,
            businessHours: {
              ...defaultBusinessHours,
              ...(savedSettings.businessHours || {}),
            },
            closedDates: Array.isArray(savedSettings.closedDates)
              ? savedSettings.closedDates
              : [],
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
    [name]:
      type === "checkbox"
        ? checked
        : name === "appointmentDuration"
          ? Number(value)
          : value,
  }));
}

  function updateBusinessHour(dayKey, field, value) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      businessHours: {
        ...currentSettings.businessHours,
        [dayKey]: {
          ...currentSettings.businessHours[dayKey],
          [field]: value,
        },
      },
    }));
  }

  function addClosedDate() {
    if (!newClosedDate) {
      setError("Choose a date before adding it.");
      return;
    }

    if (settings.closedDates.includes(newClosedDate)) {
      setError("That date is already marked as closed.");
      return;
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      closedDates: [
        ...currentSettings.closedDates,
        newClosedDate,
      ].sort(),
    }));

    setNewClosedDate("");
    setError("");
    setMessage("");
  }

  function removeClosedDate(dateToRemove) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      closedDates: currentSettings.closedDates.filter(
        (date) => date !== dateToRemove
      ),
    }));
  }

  async function saveSettings(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
    const cleanSettings = {
  businessName: settings.businessName,
  bookingsOpen: settings.bookingsOpen,
  appointmentDuration: Number(settings.appointmentDuration),
  phone: settings.phone,
  email: settings.email,
  address: settings.address,
  businessHours: settings.businessHours,
  closedDates: settings.closedDates,
};

await setDoc(
  doc(db, "settings", "business"),
  cleanSettings,
  {
    merge: true,
  }
);

setSettings((currentSettings) => ({
  ...currentSettings,
  ...cleanSettings,
}));

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
        <p className="text-zinc-400">
          Loading business settings...
        </p>
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
          Manage booking availability, hours and business
          information.
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

      <form onSubmit={saveSettings} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
  <h2 className="text-xl font-bold">Booking Settings</h2>

  <div className="mt-5 grid gap-5 sm:grid-cols-2">
    <label className="grid gap-2">
      <span className="text-sm font-semibold">
        Appointment Duration
      </span>

      <select
        name="appointmentDuration"
        value={settings.appointmentDuration}
        onChange={updateField}
        className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
      >
        <option value={30}>30 minutes</option>
        <option value={45}>45 minutes</option>
        <option value={60}>60 minutes</option>
      </select>
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
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
          <h2 className="text-xl font-bold">
            Special Closed Dates
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Add vacations, holidays or any date the barber will
            not be working.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={newClosedDate}
              onChange={(event) =>
                setNewClosedDate(event.target.value)
              }
              className="flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
            />

            <button
              type="button"
              onClick={addClosedDate}
              className="rounded-xl border border-yellow-400 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
            >
              Add Closed Date
            </button>
          </div>

          {settings.closedDates.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-500">
              No special closed dates have been added.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {settings.closedDates.map((closedDate) => (
                <div
                  key={closedDate}
                  className="flex items-center justify-between rounded-xl border border-zinc-700 bg-black px-4 py-3"
                >
                  <span className="font-semibold">
                    {new Date(
                      `${closedDate}T00:00:00`
                    ).toLocaleDateString("en-CA", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeClosedDate(closedDate)
                    }
                    className="rounded-lg px-3 py-1 text-sm font-bold text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
          <h2 className="text-xl font-bold">
            Business Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">
                Business Name
              </span>

              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={updateField}
                className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">
                Phone
              </span>

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
              <span className="text-sm font-semibold">
                Email
              </span>

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
              <span className="text-sm font-semibold">
                Address
              </span>

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
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </form>
    </main>
  );
}