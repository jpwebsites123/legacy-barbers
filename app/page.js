import { siteConfig } from "../lib/siteConfig";

export default function Home() {
  const features = [
    {
      icon: "✂️",
      title: "EXPERT BARBERS",
      text: "Skilled, experienced, trusted.",
    },
    {
      icon: "⭐",
      title: "PREMIUM PRODUCTS",
      text: "Top quality for the best results.",
    },
    {
      icon: "🕒",
      title: "ON TIME",
      text: "Respecting your schedule.",
    },
    {
      icon: "🪒",
      title: "CLEAN SPACE",
      text: "Relax and enjoy the cut.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className="relative min-h-screen bg-cover bg-center"
       style={{
  backgroundImage: `url(${siteConfig.branding.heroImage})`,
}}
      >
        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <section className="flex flex-1 items-center px-6 pb-12 pt-28">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400 md:text-base">
                  Premium Barber Studio
                </p>

                <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl md:text-7xl">
                  {siteConfig.businessName}
                </h1>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-300 md:text-lg">
                  {siteConfig.description}
                </p>

                <a
                  href="/book"
                  className="mt-8 inline-block rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black transition hover:bg-yellow-300"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          </section>

          <section className="px-6 pb-8">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/90 p-5 backdrop-blur-sm"
                >
                  <div className="text-3xl">{feature.icon}</div>

                  <div>
                    <h2 className="text-sm font-black md:text-base">
                      {feature.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}