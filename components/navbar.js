"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/book", label: "Book" },
    { href: "/contact", label: "Contact" },
  ];

  function isActive(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 shadow-lg shadow-black/20 backdrop-blur-2xl">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label={`${siteConfig.businessName} homepage`}
          onClick={() => setOpen(false)}
          className="relative z-10 rounded-xl transition duration-300 hover:scale-105 focus-visible:outline-none"
        >
          <Image
            src={siteConfig.branding.logo}
            alt={`${siteConfig.businessName} logo`}
            width={88}
            height={88}
            priority
            className="h-[72px] w-[72px] object-contain drop-shadow-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-3 text-sm font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  active
                    ? "text-yellow-400"
                    : "text-zinc-200 hover:text-yellow-400"
                }`}
              >
                {link.label}

                <span
                  className={`absolute bottom-1 left-0 h-0.5 bg-yellow-400 transition-all duration-300 ${
                    active
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Desktop Booking Button */}
        <Link
          href="/book"
          className="premium-button ml-auto hidden px-5 py-3 text-sm md:inline-flex"
        >
          Book Now
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((current) => !current)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black md:hidden"
        >
          <span className="sr-only">
            {open ? "Close menu" : "Open menu"}
          </span>

          <span
            className={`absolute h-0.5 w-6 bg-current transition duration-300 ${
              open ? "rotate-45" : "-translate-y-2"
            }`}
          />

          <span
            className={`absolute h-0.5 w-6 bg-current transition duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />

          <span
            className={`absolute h-0.5 w-6 bg-current transition duration-300 ${
              open ? "-rotate-45" : "translate-y-2"
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          open
            ? "max-h-[500px] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-4 py-4">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-4 font-semibold uppercase tracking-wider transition ${
                  active
                    ? "bg-yellow-400 text-black"
                    : "text-white hover:bg-white/5 hover:text-yellow-400"
                }`}
              >
                <span>{link.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}

          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="premium-button mt-3 w-full"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}