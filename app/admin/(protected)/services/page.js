"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../../../lib/firebase";
import { siteConfig } from "../../../../lib/siteConfig";

const emptyForm = {
  name: "",
  price: "",
  duration: "",
  description: "",
  icon: "✂️",
  active: true,
};

function createServiceId(name) {
  const cleanedName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleanedName || `service-${Date.now()}`;
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
  }).format(numericPrice);
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        const loadedServices = snapshot.docs.map((serviceDocument) => ({
          id: serviceDocument.id,
          ...serviceDocument.data(),
        }));

        loadedServices.sort((firstService, secondService) => {
          const firstOrder = Number(firstService.order) || 0;
          const secondOrder = Number(secondService.order) || 0;

          if (firstOrder !== secondOrder) {
            return firstOrder - secondOrder;
          }

          return (firstService.name || "").localeCompare(
            secondService.name || ""
          );
        });

        setServices(loadedServices);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Error loading services:", snapshotError);

        setError(
          "Could not load services. Check your Firestore security rules."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredServices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return services;
    }

    return services.filter((service) => {
      const name = service.name?.toLowerCase() || "";
      const description = service.description?.toLowerCase() || "";
      const duration = service.duration?.toLowerCase() || "";

      return (
        name.includes(searchText) ||
        description.includes(searchText) ||
        duration.includes(searchText)
      );
    });
  }, [services, search]);

  const totals = useMemo(() => {
    return {
      all: services.length,
      active: services.filter((service) => service.active !== false).length,
      inactive: services.filter((service) => service.active === false).length,
    };
  }, [services]);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function openAddForm() {
    clearMessages();
    setEditingService(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(service) {
    clearMessages();

    setEditingService(service);

    setForm({
      name: service.name || "",
      price: service.price ?? "",
      duration: service.duration || "",
      description: service.description || "",
      icon: service.icon || "✂️",
      active: service.active !== false,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingService(null);
    setForm(emptyForm);
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveService(event) {
    event.preventDefault();

    if (saving) return;

    const cleanName = form.name.trim();
    const cleanDuration = form.duration.trim();
    const cleanDescription = form.description.trim();
    const cleanIcon = form.icon.trim() || "✂️";
    const numericPrice = Number(form.price);

    if (cleanName.length < 2) {
      setError("Enter a valid service name.");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Enter a valid service price.");
      return;
    }

    if (!cleanDuration) {
      setError("Enter the service duration, such as 45 min.");
      return;
    }

    if (cleanDescription.length < 5) {
      setError("Enter a short service description.");
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), {
          name: cleanName,
          price: numericPrice,
          duration: cleanDuration,
          description: cleanDescription,
          icon: cleanIcon,
          active: form.active,
          updatedAt: serverTimestamp(),
        });

        setMessage(`${cleanName} was updated.`);
      } else {
        let serviceId = createServiceId(cleanName);

        if (services.some((service) => service.id === serviceId)) {
          serviceId = `${serviceId}-${Date.now()}`;
        }

        await setDoc(doc(db, "services", serviceId), {
          name: cleanName,
          price: numericPrice,
          duration: cleanDuration,
          description: cleanDescription,
          icon: cleanIcon,
          active: form.active,
          order: services.length + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMessage(`${cleanName} was added.`);
      }

      setShowForm(false);
      setEditingService(null);
      setForm(emptyForm);
    } catch (saveError) {
      console.error("Error saving service:", saveError);

      setError(
        "Could not save the service. Check your Firestore security rules."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service) {
    if (changingId) return;

    setChangingId(service.id);
    clearMessages();

    const nextActiveState = service.active === false;

    try {
      await updateDoc(doc(db, "services", service.id), {
        active: nextActiveState,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        `${service.name} is now ${
          nextActiveState ? "active" : "inactive"
        }.`
      );
    } catch (toggleError) {
      console.error("Error changing service status:", toggleError);

      setError(
        "Could not change the service status. Check your Firestore security rules."
      );
    } finally {
      setChangingId("");
    }
  }

  async function removeService(service) {
    if (changingId) return;

    const confirmed = window.confirm(
      `Delete "${service.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setChangingId(service.id);
    clearMessages();

    try {
      await deleteDoc(doc(db, "services", service.id));

      const remainingServices = services.filter(
        (currentService) => currentService.id !== service.id
      );

      const batch = writeBatch(db);

      remainingServices.forEach((currentService, index) => {
        batch.update(doc(db, "services", currentService.id), {
          order: index + 1,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setMessage(`${service.name} was deleted.`);
    } catch (deleteError) {
      console.error("Error deleting service:", deleteError);

      setError(
        "Could not delete the service. Check your Firestore security rules."
      );
    } finally {
      setChangingId("");
    }
  }

  async function moveService(serviceId, direction) {
    if (changingId || services.length < 2) return;

    const currentIndex = services.findIndex(
      (service) => service.id === serviceId
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= services.length) {
      return;
    }

    setChangingId(serviceId);
    clearMessages();

    const reorderedServices = [...services];
    const [movedService] = reorderedServices.splice(currentIndex, 1);

    reorderedServices.splice(targetIndex, 0, movedService);

    try {
      const batch = writeBatch(db);

      reorderedServices.forEach((service, index) => {
        batch.update(doc(db, "services", service.id), {
          order: index + 1,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setMessage("Service order updated.");
    } catch (moveError) {
      console.error("Error reordering services:", moveError);

      setError(
        "Could not reorder the services. Check your Firestore security rules."
      );
    } finally {
      setChangingId("");
    }
  }

  async function loadDefaultServices() {
    if (saving || services.length > 0) return;

    const defaultServices = Array.isArray(siteConfig.services)
      ? siteConfig.services
      : [];

    if (defaultServices.length === 0) {
      setError("No default services were found in siteConfig.js.");
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      const batch = writeBatch(db);

      defaultServices.forEach((service, index) => {
        const serviceId =
          service.id || createServiceId(service.name || `service-${index + 1}`);

        batch.set(doc(db, "services", serviceId), {
          name: service.name || "Unnamed Service",
          price: Number(service.price) || 0,
          duration: service.duration || "60 min",
          description: service.description || "",
          icon: service.icon || "✂️",
          active: service.active !== false,
          order: Number(service.order) || index + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      setMessage("Default services were added.");
    } catch (seedError) {
      console.error("Error loading default services:", seedError);

      setError(
        "Could not add the default services. Check your Firestore security rules."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-400">
            Legacy Barbers
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Services Manager
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Add, edit, organize and control the services customers can book.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 sm:w-auto"
        >
          + Add Service
        </button>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <SummaryCard label="All Services" amount={totals.all} />
        <SummaryCard label="Active" amount={totals.active} />
        <SummaryCard label="Inactive" amount={totals.inactive} />
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-300">
            Search services
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, duration or description"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
          />
        </label>
      </section>

      {message && (
        <div
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-400"
        >
          <span className="text-lg">✓</span>
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {error && (
        <div
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
        >
          <span className="text-lg">!</span>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <section className="mt-8">
        {loading && <ServicesLoadingState />}

        {!loading && services.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-3xl">
              ✂️
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No services have been added
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-zinc-400">
              Load the services already saved in your site configuration or
              create your first service manually.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadDefaultServices}
                disabled={saving}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Loading..." : "Load Default Services"}
              </button>

              <button
                type="button"
                onClick={openAddForm}
                className="rounded-xl border border-zinc-600 px-5 py-3 font-bold transition hover:border-white"
              >
                Add Manually
              </button>
            </div>
          </div>
        )}

        {!loading &&
          services.length > 0 &&
          filteredServices.length === 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
              <h2 className="text-xl font-black">No services found</h2>

              <p className="mt-2 text-zinc-400">
                Try changing your search.
              </p>
            </div>
          )}

        {!loading && filteredServices.length > 0 && (
          <div className="grid gap-4">
            {filteredServices.map((service) => {
              const originalIndex = services.findIndex(
                (currentService) => currentService.id === service.id
              );

              const isChanging = changingId === service.id;
              const isFirst = originalIndex === 0;
              const isLast = originalIndex === services.length - 1;
              const isActive = service.active !== false;

              return (
                <article
                  key={service.id}
                  className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-2xl">
                        {service.icon || "✂️"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="break-words text-xl font-black sm:text-2xl">
                            {service.name || "Unnamed Service"}
                          </h2>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                              isActive
                                ? "border-green-500/30 bg-green-500/10 text-green-400"
                                : "border-zinc-600 bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                          <span className="text-yellow-400">
                            {formatPrice(service.price)}
                          </span>

                          <span className="text-zinc-400">
                            {service.duration || "No duration"}
                          </span>

                          <span className="text-zinc-500">
                            Position {originalIndex + 1}
                          </span>
                        </div>

                        <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
                          {service.description || "No description added."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => moveService(service.id, "up")}
                        disabled={isChanging || isFirst || search.trim()}
                        className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Move Up
                      </button>

                      <button
                        type="button"
                        onClick={() => moveService(service.id, "down")}
                        disabled={isChanging || isLast || search.trim()}
                        className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Move Down
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(service)}
                        disabled={isChanging}
                        className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleService(service)}
                        disabled={isChanging}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isActive
                            ? "border border-zinc-600 hover:border-red-400 hover:text-red-400"
                            : "bg-green-500 text-black hover:bg-green-400"
                        }`}
                      >
                        {isChanging
                          ? "Updating..."
                          : isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        disabled={isChanging}
                        className="col-span-2 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete Service
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-800 p-5 sm:p-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                  Services
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {editingService ? "Edit Service" : "Add Service"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close service form"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-xl text-zinc-400 transition hover:border-white hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveService} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-[1fr_110px]">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Service Name</span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Skin Fade"
                    maxLength={60}
                    required
                    className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Icon</span>

                  <input
                    type="text"
                    name="icon"
                    value={form.icon}
                    onChange={updateForm}
                    placeholder="✂️"
                    maxLength={10}
                    className="rounded-xl border border-zinc-700 bg-black px-4 py-3 text-center text-xl outline-none transition focus:border-yellow-400"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Price</span>

                  <div className="flex overflow-hidden rounded-xl border border-zinc-700 bg-black focus-within:border-yellow-400">
                    <span className="flex items-center border-r border-zinc-700 px-4 font-bold text-zinc-400">
                      $
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={updateForm}
                      placeholder="35"
                      min="0"
                      step="0.01"
                      required
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Duration</span>

                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={updateForm}
                    placeholder="45 min"
                    maxLength={30}
                    required
                    className="rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold">Description</span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Describe what is included with this service."
                  rows={5}
                  maxLength={300}
                  required
                  className="resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                />

                <span className="text-right text-xs text-zinc-500">
                  {form.description.length}/300
                </span>
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-700 bg-black p-4">
                <div>
                  <p className="font-bold">Active Service</p>

                  <p className="mt-1 text-sm text-zinc-400">
                    Active services can be displayed to customers.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={updateForm}
                  className="h-5 w-5 shrink-0 accent-yellow-400"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-bold transition hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingService
                      ? "Save Changes"
                      : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, amount }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black sm:text-3xl">{amount}</p>
    </div>
  );
}

function ServicesLoadingState() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-zinc-800" />

            <div className="flex-1">
              <div className="h-6 w-48 animate-pulse rounded bg-zinc-800" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}