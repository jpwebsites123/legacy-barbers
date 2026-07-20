"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/admin");
      } else {
        setCheckingUser(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  function update(event) {
    const { name, value } = event.target;

    setMessage("");

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function login(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      router.replace("/admin");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-32">
        <p className="text-zinc-400">Checking login...</p>
      </main>
    );
  }

  const fieldClasses =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-12 pt-32">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
          Legacy Barbers
        </p>

        <h1 className="mt-3 text-3xl font-bold">Admin Login</h1>

        <p className="mt-2 text-zinc-400">
          Sign in to manage customer bookings.
        </p>

        <form onSubmit={login} className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Email</span>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="Admin email"
              required
              autoComplete="email"
              disabled={isSubmitting}
              className={fieldClasses}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Password</span>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              className={fieldClasses}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {message && (
          <p
            aria-live="polite"
            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}