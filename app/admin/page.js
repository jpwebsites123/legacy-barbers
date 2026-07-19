"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function load() {
      const q = query(collection(db, "bookings"), orderBy("date"));
      const snap = await getDocs(q);
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    load();
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold">Admin Bookings</h1>
      <p className="text-zinc-400 mt-2">Basic booking dashboard.</p>

      <div className="mt-8 grid gap-4">
        {bookings.length === 0 && <p>No bookings yet.</p>}
        {bookings.map(b => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xl font-bold">{b.name}</h2>
            <p className="text-zinc-300">{b.service}</p>
            <p className="text-yellow-400">{b.date} at {b.time}</p>
            <p className="text-zinc-400">{b.phone}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
