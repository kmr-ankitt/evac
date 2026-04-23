import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evac | Rapid Crisis Response",
  description: "Real-time emergency coordination platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen flex flex-col pb-16 md:pb-0`}>
        <AuthProvider>
          <Navbar />
          <EmergencyBanner />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <MobileNav />
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a',
            }
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
