import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${siteConfig.branding.heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <section className="flex flex-1 items-center px-6 pb-12 pt-28">
            <div className="section-container">
              <div className="max-w-2xl">
                <p className="fade-up text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400 md:text-base">
                  {siteConfig.homePage.badge}
                </p>

                <h1 className="fade-up-delay-1 mt-5 text-5xl font-black leading-tight sm:text-6xl md:text-7xl">
                  {siteConfig.businessName}
                </h1>

                <p className="fade-up-delay-2 mt-5 max-w-lg text-base leading-relaxed text-zinc-300 md:text-lg">
                  {siteConfig.description}
                </p>

                <Link
                  href="/book"
                  className="premium-button fade-up-delay-3 mt-8 inline-flex"
                >
                  {siteConfig.homePage.button}
                </Link>
              </div>
            </div>
          </section>

          <section className="px-6 pb-8">
            <div className="section-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.homePage.features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`premium-card fade-up-delay-${Math.min(
                    index + 1,
                    3
                  )} flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl transition duration-300 hover:bg-black/45 hover:border-yellow-400/30`}
                >
                  <div className="text-3xl">
                    {feature.icon}
                  </div>

                  <div>
                    <h2 className="text-sm font-black md:text-base">
                      {feature.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-300">
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