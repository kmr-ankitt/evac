"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LogOut, LayoutDashboard, ShieldAlert, CheckSquare, FileText, Play } from "lucide-react";
import { usePathname } from "next/navigation";

export const MobileNav = () => {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  if (!currentUser) return null;

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/alert", icon: ShieldAlert },
    { href: "/tasks", icon: CheckSquare },
    { href: "/report", icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center h-16 z-50">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="h-6 w-6" />
          </Link>
        );
      })}
    </nav>
  );
};
