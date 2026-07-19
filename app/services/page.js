const services = [
  {
    name: "Skin Fade",
    price: "$35",
    time: "45 min",
    description:
      "A clean skin fade with precision blending and a styled finish.",
    icon: "✂️",
  },
  {
    name: "Haircut",
    price: "$30",
    time: "40 min",
    description:
      "Classic or modern haircut tailored to your style and face shape.",
    icon: "💈",
  },
  {
    name: "Haircut & Beard",
    price: "$45",
    time: "60 min",
    description:
      "Fresh haircut with a sharp beard trim and lineup.",
    icon: "🧔",
  },
  {
    name: "Beard Trim",
    price: "$20",
    time: "20 min",
    description:
      "Clean beard shaping, lineup, and finishing touches.",
    icon: "🪒",
  },
  {
    name: "Kids Haircut",
    price: "$25",
    time: "30 min",
    description:
      "Professional haircut for children under 12.",
    icon: "👦",
  },
  {
    name: "Line Up",
    price: "$15",
    time: "15 min",
    description:
      "Sharp edges and crisp hairline to keep your cut looking fresh.",
    icon: "📏",
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-yellow-400 uppercase tracking-[0.35em] font-semibold">
          Legacy Barbers
        </p>

        <h1 className="text-5xl md:text-6xl font-black mt-5">
          Our Services
        </h1>

        <p className="mt-6 text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Premium barber services designed to keep you looking sharp.
          Every appointment includes attention to detail and a relaxing
          experience.
        </p>
      </section>

      {/* Services */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-yellow-400 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/10 transition duration-300"
            >
              <div className="text-5xl mb-5">{service.icon}</div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{service.name}</h2>

                <span className="text-yellow-400 font-bold text-xl">
                  {service.price}
                </span>
              </div>

              <p className="text-zinc-400 mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="bg-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300">
                  {service.time}
                </span>

                <a
                  href="/book"
                  className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-zinc-950 border-t border-zinc-800 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">
            Why Choose Legacy Barbers?
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">
            We combine modern barbering techniques with attention to detail,
            creating clean cuts, sharp fades, and precise beard work in a
            welcoming atmosphere. Every client leaves looking and feeling
            confident.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-14">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-bold text-xl">Top Quality</h3>
              <p className="text-zinc-400 mt-2">
                Professional service using premium tools and products.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="text-4xl mb-3">💈</div>
              <h3 className="font-bold text-xl">Experienced Barbers</h3>
              <p className="text-zinc-400 mt-2">
                Precision fades, modern styles, and classic cuts.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="text-4xl mb-3">🕒</div>
              <h3 className="font-bold text-xl">Always On Time</h3>
              <p className="text-zinc-400 mt-2">
                Book easily and get in the chair without long waits.
              </p>
            </div>
          </div>

          <a
            href="/book"
            className="inline-block mt-14 bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition"
          >
            Book Your Appointment
          </a>
        </div>
      </section>
    </main>
  );
}