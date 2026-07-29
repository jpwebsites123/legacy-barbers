"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../../lib/firebase";
import ImageUploader from "../../../../components/ImageUploader";

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  async function loadImages() {
    try {
      const galleryQuery = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(galleryQuery);

      const galleryImages = snapshot.docs.map((galleryDoc) => ({
        id: galleryDoc.id,
        ...galleryDoc.data(),
      }));

      setImages(galleryImages);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleAddImage(event) {
    event.preventDefault();

    if (!imageUrl) {
      alert("Upload an image first.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "gallery"), {
        title: title.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setImageUrl("");

      await loadImages();

      alert("Image added to gallery.");
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Could not add the image.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImage(id) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this image?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteDoc(doc(db, "gallery", id));

      setImages((currentImages) =>
        currentImages.filter((image) => image.id !== id)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Could not delete the image.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="space-y-8">
      {/* Page Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
            Content Management
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Gallery
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Upload, preview, and manage the photos displayed on the public
            gallery page.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/10 text-xl">
            🖼️
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Total Images
            </p>

            <p className="text-xl font-black text-white">{images.length}</p>
          </div>
        </div>
      </section>

      {/* Upload Card */}
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="border-b border-zinc-800 bg-gradient-to-r from-yellow-400/10 to-transparent px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black">
              ＋
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Add a New Image
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Upload a high-quality photo and add an optional title.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleAddImage}
          className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_0.85fr]"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="gallery-title"
                className="mb-2 block text-sm font-bold text-zinc-200"
              >
                Image title
              </label>

              <input
                id="gallery-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Fresh skin fade"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />

              <p className="mt-2 text-xs text-zinc-500">
                The title will appear below the image on the website.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-200">
                Upload image
              </label>

              <div className="rounded-xl border border-dashed border-zinc-700 bg-black/50 p-4 transition hover:border-yellow-400/70">
                <ImageUploader onUpload={setImageUrl} />
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Use a clear image with good lighting for the best result.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || !imageUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <span>{saving ? "Uploading..." : "Add to Gallery"}</span>
              {!saving && <span>→</span>}
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Image Preview</p>

                <p className="mt-1 text-xs text-zinc-500">
                  Preview how the image will look.
                </p>
              </div>

              {imageUrl && (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                  Ready
                </span>
              )}
            </div>

            {imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                <img
                  src={imageUrl}
                  alt="Upload preview"
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="p-4">
                  <p className="font-bold text-white">
                    {title.trim() || "Untitled image"}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    This image is ready to be added.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-3xl">
                  📷
                </div>

                <h3 className="mt-5 font-bold text-white">
                  No image selected
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
                  Upload an image to see a preview before adding it to the
                  gallery.
                </p>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Uploaded Images */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Uploaded Images
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Manage the photos currently stored in the gallery.
            </p>
          </div>

          {!loading && images.length > 0 && (
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-bold text-zinc-400">
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <div className="h-56 animate-pulse bg-zinc-900" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-900" />
                  <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400/10 text-4xl">
              🖼️
            </div>

            <h3 className="mt-6 text-xl font-black text-white">
              No gallery images yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Upload your first image using the form above. It will appear here
              and on the public gallery page.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40"
              >
                <div className="relative overflow-hidden bg-zinc-900">
                  <img
                    src={image.imageUrl}
                    alt={image.title || "Gallery image"}
                    className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-70" />

                  <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    Gallery Image
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="truncate text-lg font-black text-white">
                    {image.title || "Untitled image"}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Displayed on the public gallery page.
                  </p>

                  <button
                    type="button"
                    disabled={deletingId === image.id}
                    onClick={() => handleDeleteImage(image.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {deletingId === image.id
                        ? "Removing..."
                        : "Delete Image"}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}