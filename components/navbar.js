"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/book", label: "Book" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="z-10 transition-all duration-300 hover:scale-110 hover:rotate-2"
        >
          <Image
  src={siteConfig.branding.logo}
  alt={siteConfig.businessName}
            width={88}
            height={88}
            priority
            className="h-[72px] w-[72px] object-contain"
          />
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:text-yellow-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="ml-auto flex h-11 w-11 items-center justify-center text-3xl text-white transition hover:text-yellow-400 md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-4 font-semibold uppercase tracking-wider text-white transition hover:bg-white/5 hover:text-yellow-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}