import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Legacy Barbers | Barber Website Demo",
  description:
    "A modern barber shop website demo built with Next.js, Tailwind CSS, and Firebase. Created as a portfolio project to showcase responsive web design and online appointment booking.",
  keywords: [
    "barber website",
    "Next.js",
    "Tailwind CSS",
    "Firebase",
    "portfolio",
    "web developer",
    "responsive design",
  ],
  authors: [{ name: "Joshua Paddy" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}