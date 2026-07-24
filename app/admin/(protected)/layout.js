"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Star,
  Umbrella,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";

const mainLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Scissors,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const comingSoonLinks = [
  {
    name: "Business Hours",
    icon: Clock3,
  },
  {
    name: "Vacation Days",
    icon: Umbrella,
  },
  {
    name: "Gallery",
    icon: ImageIcon,
  },
  {
    name: "Reviews",
    icon: Star,
  },
  {
    name: "Analytics",
    icon: BarChart3,
  },
];

export default function ProtectedAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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

  function isActiveLink(href) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

          <p className="mt-4 text-zinc-400">Checking admin access...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <p className="text-zinc-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black">
            <Scissors size={21} />
          </div>

          <div>
            <p className="font-black leading-none">Legacy Barbers</p>
            <p className="mt-1 text-xs text-zinc-500">Admin Panel</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl border border-zinc-700 p-2.5 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          <Menu size={22} />
        </button>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-zinc-800 px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
              <Scissors size={23} />
            </div>

            <div>
              <p className="font-black">Legacy Barbers</p>
              <p className="mt-1 text-xs text-zinc-500">Admin Panel</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            Management
          </p>

          <nav className="space-y-2">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                    active
                      ? "bg-yellow-400 text-black"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="my-6 border-t border-zinc-800" />

          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            Coming Soon
          </p>

          <div className="space-y-2">
            {comingSoonLinks.map((link) => {
              const Icon = link.icon;

              return (
                <div
                  key={link.name}
                  className="flex cursor-not-allowed items-center justify-between rounded-xl px-4 py-3 text-zinc-600"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-semibold">{link.name}</span>
                  </div>

                  <span className="rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <div className="mb-3 rounded-xl bg-black p-3">
            <p className="text-xs text-zinc-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-300">
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-bold transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={19} />
            {loggingOut ? "Logging Out..." : "Log Out"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
        {children}
      </div>
    </div>
  );
}