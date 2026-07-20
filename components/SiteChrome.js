"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return children;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}