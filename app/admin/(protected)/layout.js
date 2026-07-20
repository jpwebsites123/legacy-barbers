"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

const links = [
  { name: "Dashboard", href: "/admin" },
  { name: "Bookings", href: "/admin/bookings" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut(auth);
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Checking admin access...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white lg:flex">
      <aside className="border-b border-zinc-800 bg-zinc-950 p-5 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
            Legacy Barbers
          </p>

          <h1 className="mt-2 text-2xl font-black">Admin</h1>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-xl px-4 py-3 font-semibold transition ${
                  active
                    ? "bg-yellow-400 text-black"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 w-full rounded-xl border border-zinc-700 px-4 py-3 font-bold transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 lg:mt-10"
        >
          {loggingOut ? "Logging Out..." : "Log Out"}
        </button>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}