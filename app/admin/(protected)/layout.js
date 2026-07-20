"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

const mainLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "⌂",
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: "▣",
  },
];

const comingSoonLinks = [
  { name: "Settings", icon: "⚙" },
  { name: "Services", icon: "✂" },
  { name: "Business Hours", icon: "◷" },
  { name: "Vacation Days", icon: "☀" },
  { name: "Gallery", icon: "▧" },
  { name: "Reviews", icon: "★" },
  { name: "Analytics", icon: "↗" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setCheckingAuth(false);
        router.replace("/admin/login");
        return;
      }

      setUser(currentUser);
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
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

          <p className="mt-4 text-zinc-400">Checking admin access...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white lg:flex">
      <aside className="border-b border-zinc-800 bg-zinc-950 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
              Legacy Barbers
            </p>

            <h1 className="mt-1 text-2xl font-black">Admin Panel</h1>
          </div>

          <div className="rounded-xl bg-yellow-400 px-3 py-2 text-xl text-black">
            ✂
          </div>
        </div>

        <div className="border-t border-zinc-800 px-4 py-4 lg:px-5">
          <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 lg:block">
            Management
          </p>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {mainLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" &&
                  pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/10 text-lg">
                    {link.icon}
                  </span>

                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden border-t border-zinc-800 px-5 py-5 lg:block">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            Coming Soon
          </p>

          <div className="space-y-1">
            {comingSoonLinks.map((link) => (
              <div
                key={link.name}
                className="flex cursor-not-allowed items-center justify-between rounded-xl px-4 py-3 text-zinc-600"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center text-lg">
                    {link.icon}
                  </span>

                  <span className="font-medium">{link.name}</span>
                </div>

                <span className="rounded-full border border-zinc-800 px-2 py-1 text-[10px] font-bold uppercase">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4 lg:absolute lg:bottom-0 lg:w-72 lg:p-5">
          <div className="mb-3 hidden rounded-xl border border-zinc-800 bg-black p-4 lg:block">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-zinc-200">
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-bold transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging Out..." : "Log Out"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}