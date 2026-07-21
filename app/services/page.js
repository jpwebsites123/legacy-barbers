"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const fallbackServices = [
  {
    id: "skin-fade",
    name: "Skin Fade",
    price: 35,
    duration: "45 min",
    description:
      "A clean skin fade with precision blending and a styled finish.",
    icon: "✂️",
    active: true,
    order: 1,
  },
  {
    id: "haircut",
    name: "Haircut",
    price: 30,
    duration: "40 min",
    description:
      "Classic or modern haircut tailored to your style and face shape.",
    icon: "💈",
    active: true,
    order: 2,
  },
  {
    id: "haircut-beard",
    name: "Haircut & Beard",
    price: 45,
    duration: "60 min",
    description: "Fresh haircut with a sharp beard trim and lineup.",
    icon: "🧔",
    active: true,
    order: 3,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    price: 20,
    duration: "20 min",
    description: "Clean beard shaping, lineup, and finishing touches.",
    icon: "🪒",
    active: true,
    order: 4,
  },
  {
    id: "kids-haircut",
    name: "Kids Haircut",
    price: 25,
    duration: "30 min",
    description: "Professional haircut for children under 12.",
    icon: "👦",
    active: true,
    order: 5,
  },
  {
    id: "line-up",
    name: "Line Up",
    price: 15,
    duration: "15 min",
    description:
      "Sharp edges and crisp hairline to keep your cut looking fresh.",
    icon: "📏",
    active: true,
    order: 6,
  },
];

function formatPrice(price) {
  const numberPrice = Number(price);

  if (Number.isNaN(numberPrice)) {
    return price;
  }

  return `$${numberPrice}`;
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const servicesQuery = query(
          collection(db, "services"),
          where("active", "==", true),
          orderBy("order", "asc")
        );

        const servicesSnapshot = await getDocs(servicesQuery);

        const loadedServices = servicesSnapshot.docs.map((serviceDocument) => ({
          id: serviceDocument.id,
          ...serviceDocument.data(),
        }));

        if (loadedServices.length > 0) {
          setServices(loadedServices);
        } else {
          setServices(fallbackServices);
        }
      } catch (error) {
        console.error("Error loading services:", error);
        setServices(fallbackServices);
        setServicesError(
          "We could not load the latest services. Showing the standard service list."
        );
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="px-4 pb-12 pt-28 text-center sm:px-6 sm:pb-16 sm:pt-32">
        <p className="font-semibold uppercase tracking-[0.25em] text-yellow-400 sm:tracking-[0.35em]">
          Legacy Barbers
        </p>

        <h1 className="mt-5 text-4xl font-black sm:text-5xl md:text-6xl">
          Our Services
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Premium barber services designed to keep you looking sharp. Every
          appointment includes attention to detail and a relaxing experience.
        </p>

        {servicesError && (
          <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            {servicesError}
          </p>
        )}
      </section>

      {/* Services */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        {loadingServices ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400" />

              <p className="mt-4 text-zinc-400">Loading services...</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition duration-300 hover:-translate-y-2 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/10 sm:p-8"
              >
                <div className="mb-5 text-5xl">{service.icon || "✂️"}</div>

                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold">{service.name}</h2>

                  <span className="shrink-0 text-xl font-bold text-yellow-400">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <p className="mb-6 min-h-[72px] leading-relaxed text-zinc-400">
                  {service.description}
                </p>

                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
                    {service.duration || service.time}
                  </span>

                  <a
                    href="/book"
                    className="rounded-xl bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-black sm:text-4xl">
            Why Choose Legacy Barbers?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            We combine modern barbering techniques with attention to detail,
            creating clean cuts, sharp fades, and precise beard work in a
            welcoming atmosphere. Every client leaves looking and feeling
            confident.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:mt-14">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-3 text-4xl">⭐</div>
              <h3 className="text-xl font-bold">Top Quality</h3>
              <p className="mt-2 text-zinc-400">
                Professional service using premium tools and products.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-3 text-4xl">💈</div>
              <h3 className="text-xl font-bold">Experienced Barbers</h3>
              <p className="mt-2 text-zinc-400">
                Precision fades, modern styles, and classic cuts.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-3 text-4xl">🕒</div>
              <h3 className="text-xl font-bold">Always On Time</h3>
              <p className="mt-2 text-zinc-400">
                Book easily and get in the chair without long waits.
              </p>
            </div>
          </div>

          <a
            href="/book"
            className="mt-12 inline-block rounded-xl bg-yellow-400 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-300 sm:mt-14 sm:px-10"
          >
            Book Your Appointment
          </a>
        </div>
      </section>
    </main>
  );
}