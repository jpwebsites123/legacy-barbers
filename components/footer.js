import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-12 text-center">
        {/* Logo */}
        <Link
          href="/"
          className="transition-transform duration-300 hover:scale-110"
        >
          <Image
            src={siteConfig.branding.logo}
            alt={siteConfig.businessName}
            width={70}
            height={70}
            className="object-contain"
          />
        </Link>

        {/* Business Name */}
        <h2 className="mt-4 text-2xl font-black tracking-wide text-white">
          {siteConfig.businessName.toUpperCase()}
        </h2>

        <p className="mt-2 max-w-md text-sm text-gray-400">
          {siteConfig.description}
        </p>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-semibold uppercase tracking-widest">
          <Link href="/" className="transition hover:text-yellow-400">
            Home
          </Link>

          <Link href="/services" className="transition hover:text-yellow-400">
            Services
          </Link>

          <Link href="/gallery" className="transition hover:text-yellow-400">
            Gallery
          </Link>

          <Link href="/book" className="transition hover:text-yellow-400">
            Book
          </Link>

          <Link href="/contact" className="transition hover:text-yellow-400">
            Contact
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full max-w-xl bg-white/10" />

        {/* Bottom */}
        <div className="flex w-full flex-col items-center justify-between gap-3 text-center text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.businessName}. All rights reserved.</p>

          <p>
            Designed & Built by{" "}
            <span className="font-semibold text-yellow-400">
              Joshua Paddy
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}