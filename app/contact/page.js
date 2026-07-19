export default function Contact() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Hero */}
      <section className="px-4 pb-10 pt-28 text-center sm:px-6 sm:pb-14 sm:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
          Legacy Barbers
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight sm:mt-5 sm:text-5xl md:text-6xl">
          Contact Us
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
          Have a question about a service or appointment? Reach out and we will
          get back to you as soon as possible.
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
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                    Phone
                  </p>

                  <a
                    href="tel:+16470000000"
                    className="mt-2 inline-block max-w-full break-words text-lg font-semibold transition hover:text-yellow-400 sm:text-xl"
                  >
                    (647) 000-0000
                  </a>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                    Email
                  </p>

                  <a
                    href="mailto:legacybarbers@email.com"
                    className="mt-2 block max-w-full break-all text-base font-semibold transition hover:text-yellow-400 sm:text-xl"
                  >
                    legacybarbers@email.com
                  </a>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                    Address
                  </p>

                  <p className="mt-2 break-words text-lg font-semibold sm:text-xl">
                    123 Main Street
                    <br />
                    Hamilton, Ontario
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 sm:text-sm">
                    Instagram
                  </p>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block max-w-full break-words text-lg font-semibold transition hover:text-yellow-400 sm:text-xl"
                  >
                    @legacybarbers
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-3xl sm:p-7">
              <h2 className="text-2xl font-bold">Business Hours</h2>

              <div className="mt-6 space-y-4 text-sm text-zinc-300 sm:text-base">
                <div className="flex min-w-0 items-start justify-between gap-4 border-b border-zinc-800 pb-3">
                  <span className="min-w-0">Monday</span>
                  <span className="shrink-0 text-right">Closed</span>
                </div>

                <div className="flex min-w-0 items-start justify-between gap-4 border-b border-zinc-800 pb-3">
                  <span className="min-w-0">Tuesday – Friday</span>
                  <span className="shrink-0 text-right">
                    10:00 AM – 7:00 PM
                  </span>
                </div>

                <div className="flex min-w-0 items-start justify-between gap-4 border-b border-zinc-800 pb-3">
                  <span className="min-w-0">Saturday</span>
                  <span className="shrink-0 text-right">
                    9:00 AM – 6:00 PM
                  </span>
                </div>

                <div className="flex min-w-0 items-start justify-between gap-4">
                  <span className="min-w-0">Sunday</span>
                  <span className="shrink-0 text-right">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:rounded-3xl sm:p-8">
            <h2 className="break-words text-2xl font-black sm:text-3xl">
              Send a Message
            </h2>

            <p className="mt-3 break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
              Fill out the form and we will respond as soon as possible.
            </p>

            <form className="mt-7 grid w-full min-w-0 grid-cols-1 gap-5 sm:mt-8">
              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">Name</span>

                <input
                  type="text"
                  placeholder="Your name"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                  required
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">Email</span>

                <input
                  type="email"
                  placeholder="Your email"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                  required
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">Phone</span>

                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="block w-full min-w-0 max-w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-base outline-none transition focus:border-yellow-400 sm:p-4"
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  Message
                </span>

                <textarea
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
            Ready for a Fresh Cut?
          </h2>

          <p className="mt-4 break-words text-base text-zinc-400 sm:mt-5 sm:text-lg">
            Reserve your appointment before the available spots fill up.
          </p>

          <a
            href="/book"
            className="mt-7 inline-block max-w-full rounded-xl bg-yellow-400 px-7 py-4 font-bold text-black transition hover:bg-yellow-300 sm:mt-8 sm:px-10"
          >
            Book Appointment
          </a>
        </div>
      </section>
    </main>
  );
}