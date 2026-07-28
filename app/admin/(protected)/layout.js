"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Scissors,
  Settings,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";

const navigationLinks = [
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
    name: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-yellow-400/15 blur-xl" />

          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-zinc-950 text-yellow-400">
            <LoaderCircle size={26} className="animate-spin" />
          </div>
        </div>

        <p className="mt-5 font-bold text-white">
          Checking admin access
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Please wait a moment...
        </p>
      </div>
    </main>
  );
}

function BrandLogo({ compact = false }) {
  return (
    <Link
      href="/admin"
      className="group flex min-w-0 items-center gap-3"
    >
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-[0_10px_30px_rgba(250,204,21,0.15)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_35px_rgba(250,204,21,0.25)] ${
          compact ? "h-10 w-10" : "h-11 w-11"
        }`}
      >
        <Scissors size={compact ? 21 : 23} />
      </div>

      <div className="min-w-0">
        <p className="truncate font-black leading-none text-white">
          Legacy Barbers
        </p>

        <p className="mt-1.5 text-xs font-medium text-zinc-500">
          Admin Panel
        </p>
      </div>
    </Link>
  );
}

export default function ProtectedAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setCheckingAuth(false);
          router.replace("/admin/login");
          return;
        }

        setUser(currentUser);
        setCheckingAuth(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) {
      return undefined;
    }

    function closeSidebarWithEscape(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      closeSidebarWithEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        closeSidebarWithEscape
      );

      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

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

  function getUserInitial() {
    if (!user?.email) {
      return "A";
    }

    return user.email.charAt(0).toUpperCase();
  }

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <LoaderCircle
            size={28}
            className="mx-auto animate-spin text-yellow-400"
          />

          <p className="mt-4 text-zinc-400">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 shadow-lg shadow-black/20 backdrop-blur-xl lg:hidden">
        <BrandLogo compact />

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-black text-zinc-300 transition duration-200 hover:border-yellow-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
        >
          <Menu size={21} />
        </button>
      </header>

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-zinc-800/80 px-5">
          <BrandLogo />

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-600">
            Management
          </p>

          <nav className="space-y-1.5">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 font-bold transition duration-200 ${
                    active
                      ? "bg-yellow-400 text-black shadow-[0_10px_30px_rgba(250,204,21,0.12)]"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {!active && (
                    <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-yellow-400 opacity-0 transition group-hover:opacity-100" />
                  )}

                  <Icon
                    size={20}
                    className={`shrink-0 transition duration-200 ${
                      active
                        ? "text-black"
                        : "text-zinc-500 group-hover:text-yellow-400"
                    }`}
                  />

                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-800/80 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/60 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 font-black text-yellow-400">
              {getUserInitial()}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                Administrator
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-zinc-300">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 font-bold text-zinc-300 transition duration-200 hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <LogOut size={19} />
            )}

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