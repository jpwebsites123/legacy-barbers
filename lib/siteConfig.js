export const siteConfig = {
  // ==========================
  // Business Information
  // ==========================
  businessName: "Legacy Barbers",

  description:
    "Professional barber services with simple online booking.",

  // ==========================
  // Branding
  // ==========================
  branding: {
    logo: "/logo.png",
    heroImage: "/image.png",
  },

  // ==========================
  // Homepage Hero
  // ==========================
  hero: {
    badge: "Legacy Barbers",
    title: "Sharp Cuts. Clean Confidence.",
    description:
      "Professional barber services with simple online booking.",
    primaryButton: "Book Appointment",
    secondaryButton: "View Services",
  },

  // ==========================
  // Footer
  // ==========================
  footer: {
    tagline: "Premium cuts. Professional service. Built for confidence.",
    designerName: "Joshua Paddy",
  },

  // ==========================
  // Contact Information
  // ==========================
  contact: {
    phone: "(647) 000-0000",
    email: "legacybarbers@email.com",
    address: "123 Main Street\nHamilton, Ontario",
  },

  // ==========================
  // Social Media
  // ==========================
  socialLinks: {
    instagram: "https://instagram.com",
    instagramUsername: "@legacybarbers",
    facebook: "",
    tiktok: "",
  },

  // ==========================
  // Contact Page
  // ==========================
  contactPage: {
    title: "Contact Us",
    description:
      "Have a question about a service or appointment? Reach out and we will get back to you as soon as possible.",
    formTitle: "Send a Message",
    formDescription:
      "Fill out the form and we will respond as soon as possible.",
  },

  // ==========================
  // Services Page
  // ==========================
  servicesPage: {
    title: "Our Services",
    description:
      "Premium barber services designed to keep you looking sharp. Every appointment includes attention to detail and a relaxing experience.",

    whyChooseTitle: "Why Choose Legacy Barbers?",
    whyChooseDescription:
      "We combine modern barbering techniques with attention to detail, creating clean cuts, sharp fades, and precise beard work in a welcoming atmosphere. Every client leaves looking and feeling confident.",

    bookButton: "Book Now",
    bottomButton: "Book Your Appointment",

    benefits: [
      {
        id: "quality",
        icon: "⭐",
        title: "Top Quality",
        description:
          "Professional service using premium tools and products.",
      },
      {
        id: "experience",
        icon: "💈",
        title: "Experienced Barbers",
        description:
          "Precision fades, modern styles, and classic cuts.",
      },
      {
        id: "timing",
        icon: "🕒",
        title: "Always On Time",
        description:
          "Book easily and get in the chair without long waits.",
      },
    ],
  },

  // ==========================
  // Default Services
  // ==========================
  services: [
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
      description:
        "Fresh haircut with a sharp beard trim and lineup.",
      icon: "🧔",
      active: true,
      order: 3,
    },
    {
      id: "beard-trim",
      name: "Beard Trim",
      price: 20,
      duration: "20 min",
      description:
        "Clean beard shaping, lineup, and finishing touches.",
      icon: "🪒",
      active: true,
      order: 4,
    },
    {
      id: "kids-haircut",
      name: "Kids Haircut",
      price: 25,
      duration: "30 min",
      description:
        "Professional haircut for children under 12.",
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
  ],

  // ==========================
  // Gallery Page
  // ==========================
  galleryPage: {
    title: "Our Work",
    description:
      "Take a look at some of our latest cuts, fades, beard work, and transformations.",
  },

  galleryImages: [
    {
      id: "gallery-1",
      src: "/gallery/1.jpg",
      alt: "Barber haircut example",
    },
    {
      id: "gallery-2",
      src: "/gallery/2.jpg",
      alt: "Fresh fade haircut",
    },
    {
      id: "gallery-3",
      src: "/gallery/3.jpg",
      alt: "Professional beard trim",
    },
  ],

  // ==========================
  // Bottom Call To Action
  // ==========================
  cta: {
    title: "Ready for a Fresh Cut?",
    description:
      "Reserve your appointment before the available spots fill up.",
    button: "Book Appointment",
  },

  // ==========================
  // SEO
  // ==========================
  seo: {
    title: "Legacy Barbers | Professional Barber Services",
    description:
      "Book professional barber services including haircuts, fades, beard trims, and lineups.",
    keywords: [
      "barber",
      "barbershop",
      "haircut",
      "skin fade",
      "beard trim",
      "Hamilton barber",
    ],
  },

  // ==========================
  // Booking Settings
  // ==========================
  booking: {
    appointmentDuration: 60,
    bookingsOpen: true,
  },

  // ==========================
  // Business Hours
  // ==========================
  defaultBusinessHours: {
    0: {
      name: "Sunday",
      closed: true,
      open: "10:00",
      close: "17:00",
    },
    1: {
      name: "Monday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
    2: {
      name: "Tuesday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
    3: {
      name: "Wednesday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
    4: {
      name: "Thursday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
    5: {
      name: "Friday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
    6: {
      name: "Saturday",
      closed: false,
      open: "10:00",
      close: "17:00",
    },
  },
};