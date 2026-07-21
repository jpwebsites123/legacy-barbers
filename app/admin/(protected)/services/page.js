"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function ServicesPage() {
  const [services, setServices] =useState([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    icon: "✂️",
  });

  async function loadServices() {
    setLoading(true);

    const snapshot = await getDocs(
      query(collection(db, "services"), orderBy("order"))
    );

    setServices(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function addService(e) {
    e.preventDefault();

    if (!form.name) return;

    await addDoc(collection(db, "services"), {
      ...form,
      price: Number(form.price),
      active: true,
      order: services.length + 1,
    });

    setForm({
      name: "",
      price: "",
      duration: "",
      description: "",
      icon: "✂️",
    });

    loadServices();
  }

  async function removeService(id) {
    if (!confirm("Delete this service?")) return;

    await deleteDoc(doc(db, "services", id));

    loadServices();
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-black mb-8">
        Services
      </h1>

      <form
        onSubmit={addService}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 mb-10"
      >
        <input
          placeholder="Service Name"
          value={form.name}
          onChange={(e)=>
            setForm({...form,name:e.target.value})
          }
          className="w-full bg-black rounded-lg p-3"
        />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e)=>
            setForm({...form,price:e.target.value})
          }
          className="w-full bg-black rounded-lg p-3"
        />

        <input
          placeholder="Duration"
          value={form.duration}
          onChange={(e)=>
            setForm({...form,duration:e.target.value})
          }
          className="w-full bg-black rounded-lg p-3"
        />

        <input
          placeholder="Emoji"
          value={form.icon}
          onChange={(e)=>
            setForm({...form,icon:e.target.value})
          }
          className="w-full bg-black rounded-lg p-3"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e)=>
            setForm({...form,description:e.target.value})
          }
          className="w-full bg-black rounded-lg p-3 h-28"
        />

        <button className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold">
          Add Service
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {services.map((service)=>(
            <div
              key={service.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-xl">
                  {service.icon} {service.name}
                </h2>

                <p className="text-zinc-400">
                  ${service.price} • {service.duration}
                </p>
              </div>

              <button
                onClick={()=>removeService(service.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}