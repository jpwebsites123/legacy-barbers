import Link from "next/link";
import { siteConfig } from "../../lib/siteConfig";

function formatTime(time) {
  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute} ${period}`;
}

function formatPhoneLink(phone) {
  return phone.replace(/[^\d+]/g, "");
}

export default function Contact() {
  const businessHours = Object.values(
    siteConfig.defaultBusinessHours
  );

  const addressLines = siteConfig.contact.address
    .split("\n")
    .filter(Boolean);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Hero */}
      <section className="px-4 pb-10 pt-28 text-center sm:px-6 sm:pb-14 sm:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
          {siteConfig.businessName}
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight sm:mt-5 sm:text-5xl md:text-6xl">
          {siteConfig.contactPage.title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
          {siteConfig.contactPage.description}
        </p>
      </section>

      {/* Contact Section */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Contact Information */}
          <div className="w-full min-w-0 space-y-5 sm:space-y-6">
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-7">
              <h2 className="text-2xl font-black sm:text-3xl">
                Get in Touch
              </h2>

              <div className="mt-7 space-y-6 sm:mt-8">
                {siteConfig.contact.phone && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                      Phone
                    </p>

                    <a
                      href={`tel:${formatPhoneLink(
                        siteConfig.contact.phone
                      )}`}
                      className="mt-2 inline-block max-w-full break-words text-lg font-semibold transition hover:text-yellow-400 sm:text-xl"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                )}

                {siteConfig.contact.email && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                      Email
                    </p>

                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="mt-2 block max-w-full break-all text-base font-semibold transition hover:text-yellow-400 sm:text-xl"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                )}

                {siteConfig.contact.address && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                      Address
                    </p>

                    <p className="mt-2 break-words text-lg font-semibold sm:text-xl">
                      {addressLines.map((line, index) => (
                        <span key={`${line}-${index}`}>
                          {line}

                          {index < addressLines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                {siteConfig.socialLinks.instagram && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                      Instagram
                    </p>

                    <a
                      href={siteConfig.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block max-w-full break-words text-lg font-semibold transition hover:text-yellow-400 sm:text-xl"
                    >
                      {siteConfig.socialLinks.instagramUsername ||
                        "Visit Instagram"}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-7">
              <h2 className="text-2xl font-bold">Business Hours</h2>

              <div className="mt-6 space-y-4 text-sm text-zinc-300 sm:text-base">
                {businessHours.map((day, index) => (
                  <div
                    key={day.name}
                    className={`flex min-w-0 items-start justify-between gap-4 ${
                      index < businessHours.length - 1
                        ? "border-b border-zinc-800 pb-3"
                        : ""
                    }`}
                  >
                    <span className="min-w-0">{day.name}</span>

                    <span className="shrink-0 text-right">
                      {day.closed
                        ? "Closed"
                        : `${formatTime(day.open)} – ${formatTime(
                            day.close
                          )}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:rounded-3xl sm:p-8">
            <h2 className="break-words text-2xl font-black sm:text-3xl">
              Send a Message
            </h2>

            <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
              Fill out the form and we will respond as soon as
              possible.
            </p>

            <form
              className="mt-7 grid w-full min-w-0 grid-cols-1 gap-5 sm:mt-8"
              action="#"
            >
              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  Name
                </span>

                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                  required
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  Email
                </span>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Your email"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                  required
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  Phone
                </span>

                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Your phone number"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  Message
                </span>

                <textarea
                  name="message"
                  rows={6}
                  placeholder="How can we help?"
                  className="block w-full min-w-0 max-w-full resize-none rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full max-w-full rounded-xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:bg-yellow-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="break-words text-3xl font-black md:text-4xl">
            {siteConfig.cta.title}
          </h2>

          <p className="mt-4 break-words text-base text-zinc-400 sm:mt-5 sm:text-lg">
            {siteConfig.cta.description}
          </p>

          <Link
            href="/book"
            className="mt-7 inline-block max-w-full rounded-xl bg-yellow-400 px-7 py-4 font-bold text-black transition hover:bg-yellow-300 sm:mt-8 sm:px-10"
          >
            {siteConfig.cta.button}
          </Link>
        </div>
      </section>
    </main>
  );
}