"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { db } from "../../../../lib/firebase";

const emptyForm = {
  name: "",
  price: "",
  duration: "",
  description: "",
  icon: "✂️",
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const servicesQuery = query(
        collection(db, "services"),
        orderBy("order", "asc")
      );

      const snapshot = await getDocs(servicesQuery);

      setServices(
        snapshot.docs.map((serviceDocument) => ({
          id: serviceDocument.id,
          ...serviceDocument.data(),
        }))
      );
    } catch (loadError) {
      console.error("Error loading services:", loadError);
      setError("Could not load services. Check your Firestore rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function showSuccess(message) {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function validateService(service) {
    if (!service.name.trim()) {
      return "Enter a service name.";
    }

    if (
      service.price === "" ||
      Number.isNaN(Number(service.price)) ||
      Number(service.price) < 0
    ) {
      return "Enter a valid price.";
    }

    if (!service.duration.trim()) {
      return "Enter a duration, such as 30 min.";
    }

    if (!service.description.trim()) {
      return "Enter a description.";
    }

    return "";
  }

  async function addService(event) {
    event.preventDefault();

    const validationError = validateService(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addDoc(collection(db, "services"), {
        name: form.name.trim(),
        price: Number(form.price),
        duration: form.duration.trim(),
        description: form.description.trim(),
        icon: form.icon.trim() || "✂️",
        active: true,
        order: services.length + 1,
      });

      setForm(emptyForm);
      await loadServices();
      showSuccess("Service added.");
    } catch (addError) {
      console.error("Error adding service:", addError);
      setError("Could not add the service.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(service) {
    setEditingId(service.id);

    setEditForm({
      name: service.name || "",
      price: service.price ?? "",
      duration: service.duration || "",
      description: service.description || "",
      icon: service.icon || "✂️",
    });

    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(emptyForm);
    setError("");
  }

  async function saveService(serviceId) {
    const validationError = validateService(editForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    setActionId(serviceId);
    setError("");

    try {
      await updateDoc(doc(db, "services", serviceId), {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        duration: editForm.duration.trim(),
        description: editForm.description.trim(),
        icon: editForm.icon.trim() || "✂️",
      });

      setEditingId(null);
      setEditForm(emptyForm);

      await loadServices();
      showSuccess("Service updated.");
    } catch (saveError) {
      console.error("Error updating service:", saveError);
      setError("Could not update the service.");
    } finally {
      setActionId(null);
    }
  }

  async function toggleService(service) {
    setActionId(service.id);
    setError("");

    try {
      await updateDoc(doc(db, "services", service.id), {
        active: !service.active,
      });

      setServices((currentServices) =>
        currentServices.map((currentService) =>
          currentService.id === service.id
            ? {
                ...currentService,
                active: !currentService.active,
              }
            : currentService
        )
      );

      showSuccess(service.active ? "Service hidden." : "Service shown.");
    } catch (toggleError) {
      console.error("Error changing service visibility:", toggleError);
      setError("Could not change the service visibility.");
    } finally {
      setActionId(null);
    }
  }

  async function removeService(service) {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionId(service.id);
    setError("");

    try {
      await deleteDoc(doc(db, "services", service.id));

      const remainingServices = services.filter(
        (currentService) => currentService.id !== service.id
      );

      const batch = writeBatch(db);

      remainingServices.forEach((currentService, index) => {
        batch.update(doc(db, "services", currentService.id), {
          order: index + 1,
        });
      });

      await batch.commit();

      if (editingId === service.id) {
        cancelEditing();
      }

      await loadServices();
      showSuccess("Service deleted.");
    } catch (deleteError) {
      console.error("Error deleting service:", deleteError);
      setError("Could not delete the service.");
    } finally {
      setActionId(null);
    }
  }

  async function moveService(index, direction) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= services.length) {
      return;
    }

    const reorderedServices = [...services];

    [reorderedServices[index], reorderedServices[newIndex]] = [
      reorderedServices[newIndex],
      reorderedServices[index],
    ];

    setServices(reorderedServices);
    setActionId(services[index].id);
    setError("");

    try {
      const batch = writeBatch(db);

      reorderedServices.forEach((service, serviceIndex) => {
        batch.update(doc(db, "services", service.id), {
          order: serviceIndex + 1,
        });
      });

      await batch.commit();
      showSuccess("Service order updated.");
    } catch (moveError) {
      console.error("Error reordering services:", moveError);
      setError("Could not reorder the services.");
      await loadServices();
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-400">
          Legacy Barbers
        </p>

        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          Services Manager
        </h1>

        <p className="mt-3 text-zinc-400">
          Add, edit, hide, delete, and reorder the services shown on the
          website.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {success}
        </div>
      )}

      <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
            <Plus size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold">Add a Service</h2>
            <p className="text-sm text-zinc-500">
              Create a new service for the public website.
            </p>
          </div>
        </div>

        <form onSubmit={addService} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Service name
            </span>

            <input
              type="text"
              placeholder="Skin Fade"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Price
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="35"
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price: event.target.value,
                })
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Duration
            </span>

            <input
              type="text"
              placeholder="45 min"
              value={form.duration}
              onChange={(event) =>
                setForm({
                  ...form,
                  duration: event.target.value,
                })
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Emoji
            </span>

            <input
              type="text"
              placeholder="✂️"
              value={form.icon}
              onChange={(event) =>
                setForm({
                  ...form,
                  icon: event.target.value,
                })
              }
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Description
            </span>

            <textarea
              placeholder="Describe the service..."
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              className="min-h-28 w-full resize-y rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={19} />
              {saving ? "Adding..." : "Add Service"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Current Services</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {services.length} service{services.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />
              <p className="mt-4 text-zinc-400">Loading services...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
            <ScissorsIcon />
            <h3 className="mt-4 text-xl font-bold">No services yet</h3>
            <p className="mt-2 text-zinc-500">
              Add your first service using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => {
              const isEditing = editingId === service.id;
              const isWorking = actionId === service.id;

              return (
                <article
                  key={service.id}
                  className={`rounded-2xl border bg-zinc-950 p-5 transition sm:p-6 ${
                    service.active
                      ? "border-zinc-800"
                      : "border-zinc-800 opacity-60"
                  }`}
                >
                  {isEditing ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-300">
                          Service name
                        </span>

                        <input
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              name: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-300">
                          Price
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              price: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-300">
                          Duration
                        </span>

                        <input
                          value={editForm.duration}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              duration: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-300">
                          Emoji
                        </span>

                        <input
                          value={editForm.icon}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              icon: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <label className="md:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-zinc-300">
                          Description
                        </span>

                        <textarea
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              description: event.target.value,
                            })
                          }
                          className="min-h-28 w-full resize-y rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-yellow-400"
                        />
                      </label>

                      <div className="flex flex-wrap gap-3 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => saveService(service.id)}
                          disabled={isWorking}
                          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300 disabled:opacity-50"
                        >
                          <Save size={18} />
                          {isWorking ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isWorking}
                          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:bg-zinc-900"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-4xl">
                            {service.icon || "✂️"}
                          </span>

                          <div>
                            <h3 className="text-xl font-bold">
                              {service.name}
                            </h3>

                            <p className="mt-1 font-semibold text-yellow-400">
                              ${Number(service.price).toFixed(2)} ·{" "}
                              {service.duration}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              service.active
                                ? "bg-green-500/10 text-green-400"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {service.active ? "Visible" : "Hidden"}
                          </span>
                        </div>

                        <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          title="Move up"
                          onClick={() => moveService(index, -1)}
                          disabled={index === 0 || isWorking}
                          className="rounded-xl border border-zinc-700 p-3 transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp size={18} />
                        </button>

                        <button
                          type="button"
                          title="Move down"
                          onClick={() => moveService(index, 1)}
                          disabled={
                            index === services.length - 1 || isWorking
                          }
                          className="rounded-xl border border-zinc-700 p-3 transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleService(service)}
                          disabled={isWorking}
                          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold transition hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                        >
                          {service.active ? (
                            <>
                              <EyeOff size={18} />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye size={18} />
                              Show
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditing(service)}
                          disabled={isWorking}
                          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold transition hover:border-blue-400 hover:text-blue-400 disabled:opacity-50"
                        >
                          <Pencil size={18} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          disabled={isWorking}
                          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ScissorsIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-3xl">
      ✂️
    </div>
  );
}