const photos = [
  {
    image: "/skinfade.png",
    title: "Skin Fade",
    description: "Clean fade with a sharp finish.",
  },
  {
    image: "/beard-lineup.png",
    title: "Haircut & Beard",
    description: "Fresh cut paired with a detailed beard trim.",
  },
  {
    image: "/classic-cut.png",
    title: "Classic Cut",
    description: "Timeless style with a modern touch.",
  },
  {
    image: "/sharp-lineup.png",
    title: "Sharp Line Up",
    description: "Crisp edges and perfect detail.",
  },
  {
    image: "/premium-grooming.png",
    title: "Premium Grooming",
    description: "Professional grooming experience.",
  },
  {
    image: "/shop-interior.png",
    title: "Shop Interior",
    description: "A clean, modern barbershop built for comfort.",
  },
];

export default function Gallery() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <p className="uppercase tracking-[0.35em] text-yellow-400 font-semibold">
          Legacy Barbers
        </p>

        <h1 className="text-5xl md:text-6xl font-black mt-5">
          Our Gallery
        </h1>

        <p className="text-zinc-400 max-w-2xl mx-auto mt-6 text-lg">
          Every cut is done with precision and attention to detail. Here&apos;s
          a look at some of our work.
        </p>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.title}
              className="group relative h-80 overflow-hidden rounded-3xl border border-zinc-800 hover:border-yellow-400 transition duration-300"
            >
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Transparent gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-white">
                  {photo.title}
                </h2>

                <p className="text-zinc-200 mt-2 max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300">
                  {photo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-zinc-950 border-t border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black">
            Ready for Your Next Cut?
          </h2>

          <p className="text-zinc-400 mt-6 text-lg">
            Join hundreds of satisfied clients and experience the Legacy
            Barbers difference.
          </p>

          <a
            href="/book"
            className="inline-block mt-10 bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition"
          >
            Book Appointment
          </a>
        </div>
      </section>
    </main>
  );
}