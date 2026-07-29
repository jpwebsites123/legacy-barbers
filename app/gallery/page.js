"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { siteConfig } from "../../lib/siteConfig";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGalleryImages() {
      try {
        const galleryQuery = query(
          collection(db, "gallery"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(galleryQuery);

        const uploadedImages = snapshot.docs.map((galleryDocument) => ({
          id: galleryDocument.id,
          ...galleryDocument.data(),
        }));

        setImages(uploadedImages);
      } catch (error) {
        console.error("Error loading public gallery:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGalleryImages();
  }, []);

  const defaultImages = siteConfig.galleryImages || [];
  const displayedImages =
    images.length > 0 ? images : defaultImages;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="section-spacing text-center">
        <div className="section-container">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400 sm:text-sm">
            {siteConfig.businessName}
          </p>

          <h1 className="section-title mx-auto mt-5 max-w-4xl">
            {siteConfig.galleryPage?.title || "Our Work"}
          </h1>

          <p className="section-description mx-auto max-w-2xl">
            {siteConfig.galleryPage?.description ||
              "Take a look at some of our latest cuts and transformations."}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="section-container">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                >
                  <div className="aspect-[4/3] animate-pulse bg-zinc-900" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-900" />
                    <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedImages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400/10 text-4xl">
                📷
              </div>

              <h2 className="mt-6 text-2xl font-black">
                Gallery coming soon
              </h2>

              <p className="mx-auto mt-3 max-w-md text-zinc-400">
                New cuts and transformations will be added here soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedImages.map((image, index) => (
                <article
                  key={image.id || `${image.imageUrl}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={
                        image.alt ||
                        image.title ||
                        "Legacy Barbers gallery image"
                      }
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-xl font-black">
                        {image.title || "Legacy Barbers"}
                      </h2>
                    </div>
                  </div>

                  {image.description && (
                    <div className="p-5">
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {image.description}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent" />

        <div className="section-spacing relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-bold uppercase tracking-[0.3em] text-yellow-400">
              Ready for Your Next Cut?
            </p>

            <h2 className="section-title mt-5">
              Look Sharp. Feel Confident.
            </h2>

            <p className="section-description mx-auto max-w-2xl">
              Book your appointment today and get the clean, professional
              look you want.
            </p>

            <Link
              href="/book"
              className="premium-button mt-8 sm:mt-10"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}