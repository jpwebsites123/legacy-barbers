"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const defaultPhotos = [
  {
    id: "skinfade",
    imageUrl: "/skinfade.png",
    title: "Skin Fade",
    description: "Clean fade with a sharp finish.",
  },
  {
    id: "beard-lineup",
    imageUrl: "/beard-lineup.png",
    title: "Haircut & Beard",
    description: "Fresh cut paired with a detailed beard trim.",
  },
  {
    id: "classic-cut",
    imageUrl: "/classic-cut.png",
    title: "Classic Cut",
    description: "Timeless style with a modern touch.",
  },
  {
    id: "sharp-lineup",
    imageUrl: "/sharp-lineup.png",
    title: "Sharp Line Up",
    description: "Crisp edges and perfect detail.",
  },
  {
    id: "premium-grooming",
    imageUrl: "/premium-grooming.png",
    title: "Premium Grooming",
    description: "Professional grooming experience.",
  },
  {
    id: "shop-interior",
    imageUrl: "/shop-interior.png",
    title: "Shop Interior",
    description: "A clean, modern barbershop built for comfort.",
  },
];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const galleryQuery = query(
          collection(db, "gallery"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(galleryQuery);

        const uploadedPhotos = snapshot.docs.map((galleryDoc) => ({
          id: galleryDoc.id,
          ...galleryDoc.data(),
        }));

        setPhotos(
          uploadedPhotos.length > 0 ? uploadedPhotos : defaultPhotos
        );
      } catch (error) {
        console.error("Error loading gallery:", error);

        // Keep the original photos visible if Firestore fails.
        setPhotos(defaultPhotos);
      } finally {
        setLoading(false);
      }
    }

    loadPhotos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="px-6 pb-16 pt-32 text-center">
        <p className="font-semibold uppercase tracking-[0.35em] text-yellow-400">
          Legacy Barbers
        </p>

        <h1 className="mt-5 text-5xl font-black md:text-6xl">
          Our Gallery
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          Every cut is done with precision and attention to detail. Here&apos;s
          a look at some of our work.
        </p>
      </section>

      {/* Gallery Grid */}
      <section className="px-6 pb-24">
        {loading ? (
          <p className="text-center text-zinc-400">
            Loading gallery...
          </p>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative h-80 overflow-hidden rounded-3xl border border-zinc-800 transition duration-300 hover:border-yellow-400"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || "Legacy Barbers gallery image"}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    {photo.title || "Legacy Barbers"}
                  </h2>

                  {photo.description && (
                    <p className="mt-2 max-h-0 overflow-hidden text-zinc-200 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black">
            Ready for Your Next Cut?
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Join hundreds of satisfied clients and experience the Legacy
            Barbers difference.
          </p>

          <a
            href="/book"
            className="mt-10 inline-block rounded-xl bg-yellow-400 px-10 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            Book Appointment
          </a>
        </div>
      </section>
    </main>
  );
}