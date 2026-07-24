"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalServices: 0,
    totalGalleryImages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const bookingsSnapshot = await getDocs(
          collection(db, "bookings")
        );

        const upcomingQuery = query(
          collection(db, "bookings"),
          where("status", "==", "upcoming")
        );

        const upcomingSnapshot = await getDocs(upcomingQuery);

        const servicesSnapshot = await getDocs(
          collection(db, "services")
        );

        const gallerySnapshot = await getDocs(
          collection(db, "gallery")
        );

        setStats({
          totalBookings: bookingsSnapshot.size,
          upcomingBookings: upcomingSnapshot.size,
          totalServices: servicesSnapshot.size,
          totalGalleryImages: gallerySnapshot.size,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: "📅",
    },
    {
      label: "Upcoming Bookings",
      value: stats.upcomingBookings,
      icon: "⏳",
    },
    {
      label: "Services",
      value: stats.totalServices,
      icon: "✂️",
    },
    {
      label: "Gallery Images",
      value: stats.totalGalleryImages,
      icon: "🖼️",
    },
  ];

  return (
    <main className="p-8">
      <p className="font-semibold uppercase text-yellow-400">
        Legacy Barbers
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Dashboard
      </h1>

      <p className="mt-3 text-zinc-400">
        Welcome to the admin dashboard.
      </p>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-400">
                {card.label}
              </p>

              <span className="text-2xl">
                {card.icon}
              </span>
            </div>

            <p className="mt-6 text-4xl font-black text-white">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}