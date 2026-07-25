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
import { siteConfig } from "../../lib/siteConfig";

const fallbackServices = siteConfig.services;

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
          {siteConfig.businessName}
        </p>

        <h1 className="mt-5 text-4xl font-black sm:text-5xl md:text-6xl">
          {siteConfig.servicesPage.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {siteConfig.servicesPage.description}
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
                    {siteConfig.servicesPage.bookButton}
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
            {siteConfig.servicesPage.whyChooseTitle}
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {siteConfig.servicesPage.whyChooseDescription}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:mt-14">
            {siteConfig.servicesPage.benefits.map((benefit) => (
  <div
    key={benefit.id}
    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
  >
    <div className="mb-3 text-4xl">{benefit.icon}</div>

    <h3 className="text-xl font-bold">{benefit.title}</h3>

    <p className="mt-2 text-zinc-400">
      {benefit.description}
    </p>
  </div>
))}
</div>
          <a
            href="/book"
            className="mt-12 inline-block rounded-xl bg-yellow-400 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-300 sm:mt-14 sm:px-10"
          >
            {siteConfig.servicesPage.bottomButton}
          </a>
        </div>
      </section>
    </main>
  );
}