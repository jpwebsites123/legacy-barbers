import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Footer() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/book", label: "Book" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    {
      href: siteConfig.socialLinks?.instagram,
      label: "Instagram",
    },
    {
      href: siteConfig.socialLinks?.facebook,
      label: "Facebook",
    },
    {
      href: siteConfig.socialLinks?.tiktok,
      label: "TikTok",
    },
  ].filter((social) => social.href);

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-yellow-400/5 to-transparent" />

      <div className="section-container relative px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label={`${siteConfig.businessName} homepage`}
              className="inline-flex rounded-2xl transition duration-300 hover:scale-105"
            >
              <Image
                src={siteConfig.branding.logo}
                alt={`${siteConfig.businessName} logo`}
                width={84}
                height={84}
                className="h-[76px] w-[76px] object-contain drop-shadow-lg"
              />
            </Link>

            <h2 className="mt-5 text-2xl font-black tracking-wide text-white">
              {siteConfig.businessName.toUpperCase()}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
              {siteConfig.footer?.description || siteConfig.description}
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-yellow-400">
              Navigation
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex w-fit items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-yellow-400"
                >
                  <span className="transition duration-300 group-hover:translate-x-1">
                    {link.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-yellow-400">
              Contact
            </h3>

            <div className="mt-5 space-y-4 text-sm text-zinc-400">
              {siteConfig.contact?.phone && (
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/[^\d+]/g, "")}`}
                  className="block transition hover:text-yellow-400"
                >
                  {siteConfig.contact.phone}
                </a>
              )}

              {siteConfig.contact?.email && (
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="block break-all transition hover:text-yellow-400"
                >
                  {siteConfig.contact.email}
                </a>
              )}

              {siteConfig.contact?.address && (
                <p className="whitespace-pre-line leading-relaxed">
                  {siteConfig.contact.address}
                </p>
              )}
            </div>

            <Link
              href="/book"
              className="premium-outline-button mt-6 px-5 py-3 text-sm"
            >
              {siteConfig.footer?.button || "Book Appointment"}
            </Link>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-zinc-500 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} {siteConfig.businessName}. All rights
            reserved.
          </p>

          <p>
            Designed &amp; Built by{" "}
            <span className="font-semibold text-yellow-400">
              Joshua Paddy
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}