"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LogOut, LayoutDashboard, ShieldAlert, CheckSquare, FileText, Database } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import toast from "react-hot-toast";

export const getRoleColor = (role: string | null) => {
  switch (role) {
    case "admin": return "text-red-500 bg-red-500/10 border-red-500/20";
    case "security": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "medical": return "text-green-500 bg-green-500/10 border-green-500/20";
    case "management": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
  }
};

export const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const pathname = usePathname();
  const [hasIncident, setHasIncident] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const incidentRef = ref(rtdb, 'activeIncident');
    const unsubscribe = onValue(incidentRef, (snapshot) => {
      setHasIncident(snapshot.exists());
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser) return null;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch('/api/seed-demo', { method: 'POST' });
      toast.success('Demo data seeded!');
    } catch (e) {
      toast.error('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Trigger Alert", href: "/alert", icon: ShieldAlert },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Reports", href: "/report", icon: FileText },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 h-[64px] flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span className="text-xl font-bold tracking-wider text-white">Evac</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
        {hasIncident ? (
          <div className="flex items-center gap-2 bg-red-500/20 text-red-500 px-4 py-1 rounded-full border border-red-500/30 text-sm font-bold uppercase tracking-widest animate-pulse">
            Active Incident
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-1 rounded-full border border-green-500/20 text-sm font-bold uppercase tracking-widest">
            All Clear
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {userRole === 'admin' && (
          <button onClick={handleSeed} disabled={seeding} className="hidden md:flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors disabled:opacity-50">
            <Database className="h-3 w-3" /> Seed Demo
          </button>
        )}
        {userRole && (
          <div className={`hidden sm:block px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getRoleColor(userRole)}`}>
            {userRole}
          </div>
        )}
        <div className="hidden sm:block text-sm text-zinc-300">{currentUser.email?.split('@')[0]}</div>
        <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-zinc-800" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};
