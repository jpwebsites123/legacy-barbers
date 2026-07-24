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
import { db } from "@/lib/firebase";
import ImageUploader from "@/components/ImageUploader";

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function handleAddImage(e) {
    e.preventDefault();

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

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      setImages((currentImages) =>
        currentImages.filter((image) => image.id !== id)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Could not delete the image.");
    }
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="mt-2 text-gray-400">
          Upload and manage photos shown on the website.
        </p>
      </div>

      <form
        onSubmit={handleAddImage}
        className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Image title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Fresh fade"
            className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Upload image
          </label>

          <ImageUploader onUpload={setImageUrl} />
        </div>

        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-green-400">
              Image uploaded successfully.
            </p>

            <img
              src={imageUrl}
              alt="Upload preview"
              className="h-48 w-full max-w-sm rounded-lg object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !imageUrl}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add to Gallery"}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Uploaded Images</h2>

        {loading ? (
          <p className="text-gray-400">Loading gallery...</p>
        ) : images.length === 0 ? (
          <p className="text-gray-400">
            No gallery images have been added yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || "Gallery image"}
                  className="h-56 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <h3 className="font-semibold">
                    {image.title || "Untitled image"}
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
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