"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  CheckCircle2,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { db } from "../../../../lib/firebase";
import ImageUploader from "../../../../components/ImageUploader";

function GallerySkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <article
          key={item}
          className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
        >
          <div className="h-64 animate-pulse bg-zinc-900" />

          <div className="space-y-4 p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-900" />
          </div>
        </article>
      ))}
    </div>
  );
}

function DeleteConfirmationModal({
  image,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!image) {
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
        aria-labelledby="delete-image-title"
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
          id="delete-image-title"
          className="mt-5 text-2xl font-black text-white"
        >
          Remove this image?
        </h2>

        <p className="mt-3 leading-7 text-zinc-400">
          This will permanently remove{" "}
          <span className="font-bold text-white">
            {image.title || "this image"}
          </span>{" "}
          from the website gallery.
        </p>

        <img
          src={image.imageUrl}
          alt={image.title || "Gallery preview"}
          className="mt-5 h-40 w-full rounded-2xl object-cover"
        />

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep Image
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
                Removing
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [imageToDelete, setImageToDelete] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadImages() {
    setLoading(true);
    setError("");

    try {
      const galleryQuery = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(galleryQuery);

      const galleryImages = snapshot.docs.map((galleryDocument) => ({
        id: galleryDocument.id,
        ...galleryDocument.data(),
      }));

      setImages(galleryImages);
    } catch (loadError) {
      console.error("Error loading gallery:", loadError);

      setError(
        "Could not load the gallery. Check your Firebase connection and security rules."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
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

  const filteredImages = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return images;
    }

    return images.filter((image) => {
      const imageTitle = image.title?.toLowerCase() || "untitled image";

      return imageTitle.includes(searchText);
    });
  }, [images, search]);

  async function handleAddImage(event) {
    event.preventDefault();

    if (!imageUrl || saving) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await addDoc(collection(db, "gallery"), {
        title: title.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setImageUrl("");

      await loadImages();

      setMessage("Image added to the gallery.");
    } catch (saveError) {
      console.error("Error adding image:", saveError);

      setError(
        "Could not add the image. Check your Firebase security rules."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleUpload(url) {
    setImageUrl(url);
    setError("");
    setMessage("Image uploaded. Press Add to Gallery to publish it.");
  }

  function requestDeleteImage(image) {
    if (deletingId) {
      return;
    }

    setImageToDelete(image);
    setMessage("");
    setError("");
  }

  async function confirmDeleteImage() {
    if (!imageToDelete || deletingId) {
      return;
    }

    const imageId = imageToDelete.id;

    setDeletingId(imageId);
    setMessage("");
    setError("");

    try {
      await deleteDoc(doc(db, "gallery", imageId));

      setImages((currentImages) =>
        currentImages.filter((image) => image.id !== imageId)
      );

      setImageToDelete(null);
      setMessage("Image removed from the gallery.");
    } catch (deleteError) {
      console.error("Error deleting image:", deleteError);

      setError(
        "Could not remove the image. Check your Firebase security rules."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8 xl:p-10">
      <DeleteConfirmationModal
        image={imageToDelete}
        deleting={
          Boolean(imageToDelete) &&
          deletingId === imageToDelete.id
        }
        onCancel={() => {
          if (!deletingId) {
            setImageToDelete(null);
          }
        }}
        onConfirm={confirmDeleteImage}
      />

      <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-bold uppercase tracking-[0.22em] text-yellow-400">
            Legacy Barbers
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
              Gallery Manager
            </h1>

            {!loading && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm font-black text-zinc-400">
                {images.length}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Upload and manage the photos shown in the website gallery.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <Images size={20} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Published
            </p>

            <p className="mt-1 font-bold text-white">
              {loading ? "Loading..." : `${images.length} images`}
            </p>
          </div>
        </div>
      </header>

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

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(340px,0.75fr)_minmax(0,1.25fr)]">
        <form
          onSubmit={handleAddImage}
          className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-black/20 sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-black">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                Add New Image
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Upload a photo, add an optional title and publish it.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">
                Image title
              </span>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Fresh fade"
                maxLength={80}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />

              <span className="text-xs text-zinc-600">
                Optional, {title.length}/80 characters
              </span>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">
                Upload image
              </span>

              <div className="rounded-2xl border border-dashed border-zinc-700 bg-black/50 p-5 transition hover:border-yellow-400/50">
                <ImageUploader onUpload={handleUpload} />
              </div>
            </div>

            {imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 size={17} />
                    Ready to publish
                  </div>

                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    aria-label="Remove uploaded image"
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>

                <img
                  src={imageUrl}
                  alt="Upload preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !imageUrl}
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Adding Image
                </>
              ) : (
                <>
                  <Upload size={19} />
                  Add to Gallery
                </>
              )}
            </button>
          </div>
        </form>

        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Uploaded Images
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage the photos currently shown on the website.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search images"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
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
          </div>

          <div className="mt-6">
            {loading ? (
              <GallerySkeleton />
            ) : filteredImages.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
                  <ImageIcon size={34} />
                </div>

                <h3 className="mt-6 text-2xl font-black text-white">
                  {search
                    ? "No images found"
                    : "No gallery images yet"}
                </h3>

                <p className="mx-auto mt-3 max-w-md text-zinc-400">
                  {search
                    ? "Try using a different search term."
                    : "Upload your first photo and it will appear here."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredImages.map((image) => {
                  const isDeleting = deletingId === image.id;

                  return (
                    <article
                      key={image.id}
                      className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.title || "Gallery image"}
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="truncate text-lg font-black text-white">
                            {image.title || "Untitled image"}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => requestDeleteImage(image)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-400 transition hover:border-red-400 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}

                          Remove Image
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}