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
          backgroundImage: "url('/image.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 min-h-screen flex flex-col">
          <section className="flex flex-1 items-center px-6 pt-28 pb-12">
            <div className="max-w-7xl mx-auto w-full">
              <div className="max-w-2xl">
                <p className="text-yellow-400 uppercase tracking-[0.3em] text-sm md:text-base font-semibold">
                  Premium Barber Studio
                </p>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mt-5 leading-tight">
                  Legacy Barbers
                </h1>

                <p className="text-zinc-300 mt-5 max-w-lg text-base md:text-lg leading-relaxed">
                  Premium haircuts, skin fades, and beard grooming for the
                  modern gentleman.
                </p>

                <a
                  href="/book"
                  className="inline-block mt-8 bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          </section>

          <section className="px-6 pb-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="text-3xl">{feature.icon}</div>

                  <div>
                    <h2 className="font-black text-sm md:text-base">
                      {feature.title}
                    </h2>

                    <p className="text-zinc-400 text-sm mt-1">
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