"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { Flame, Cross, AlertTriangle, ShieldAlert, X } from "lucide-react";
import { collection, addDoc, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Incident } from "@/lib/types";

export default function AlertPage() {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<Incident['type'] | null>(null);
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<Incident['severity']>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const { currentUser, userRole } = useAuth();
  const router = useRouter();

  const types = [
    { id: 'FIRE', label: 'FIRE', icon: Flame, color: 'text-orange-500', border: 'border-orange-500', bgHover: 'hover:bg-orange-500/10' },
    { id: 'MEDICAL', label: 'MEDICAL', icon: Cross, color: 'text-green-500', border: 'border-green-500', bgHover: 'hover:bg-green-500/10' },
    { id: 'DISASTER', label: 'DISASTER', icon: AlertTriangle, color: 'text-yellow-500', border: 'border-yellow-500', bgHover: 'hover:bg-yellow-500/10' },
    { id: 'SECURITY', label: 'SECURITY', icon: ShieldAlert, color: 'text-blue-500', border: 'border-blue-500', bgHover: 'hover:bg-blue-500/10' }
  ] as const;

  const severities = [
    { id: 'LOW', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
    { id: 'MEDIUM', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    { id: 'HIGH', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
    { id: 'CRITICAL', color: 'bg-red-500/20 text-red-400 border-red-500/50' }
  ] as const;

  const declareEmergency = async () => {
    if (!type || !location || !currentUser) return;
    setIsSubmitting(true);

    try {
      const newIncidentId = doc(collection(db, 'incidents')).id;
      const incidentData: Incident = {
        id: newIncidentId,
        type,
        severity,
        status: 'active',
        location,
        createdAt: Date.now(),
        createdBy: currentUser.uid,
      };

      // 1. Write to Firestore
      await set(doc(db, 'incidents', newIncidentId), incidentData);

      // 2. Write to Realtime DB
      await set(ref(rtdb, 'activeIncident'), incidentData);

      // 3. POST to /api/alert
      await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      // 4. Write log
      await addDoc(collection(db, 'logs'), {
        incidentId: newIncidentId,
        message: `Emergency declared: ${type} at ${location}`,
        actor: currentUser.email,
        actorRole: userRole,
        timestamp: Date.now()
      });

      setShowModal(false);
      setShowFlash(true);

      // 5 & 6. Flash and redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);

    } catch (error: any) {
      toast.error('Failed to declare emergency: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {!showFlash && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full max-w-lg aspect-square sm:aspect-video bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full sm:rounded-[3rem] shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 border-8 border-red-500/30"
          >
            <AlertTriangle className="h-24 w-24 mb-6" />
            <span className="text-4xl sm:text-5xl font-black tracking-tighter">DECLARE</span>
            <span className="text-4xl sm:text-5xl font-black tracking-tighter">EMERGENCY</span>
          </button>
        )}

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                <h2 className="text-2xl font-bold text-white">Emergency Details</h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Emergency Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          type === t.id ? `${t.border} bg-zinc-800` : `border-zinc-800 hover:border-zinc-600 ${t.bgHover}`
                        }`}
                      >
                        <t.icon className={`h-8 w-8 mb-2 ${t.color}`} />
                        <span className="font-bold text-sm tracking-wide">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Floor 3, Room 312"
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-red-500 transition-colors text-lg"
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Severity</label>
                  <div className="flex flex-wrap gap-3">
                    {severities.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSeverity(s.id as any)}
                        className={`px-6 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                          severity === s.id ? s.color : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        {s.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800 bg-zinc-950/50">
                <button
                  onClick={declareEmergency}
                  disabled={!type || !location || isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-xl tracking-widest py-5 rounded-xl transition-colors shadow-lg disabled:shadow-none flex items-center justify-center"
                >
                  {isSubmitting ? "PROCESSING..." : "CONFIRM EMERGENCY"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Flash */}
        {showFlash && (
          <div className="fixed inset-0 z-[100] bg-red-600 flex items-center justify-center animate-[pulse_0.5s_ease-in-out_infinite]">
            <div className="text-center">
              <AlertTriangle className="h-32 w-32 text-white mx-auto mb-8 animate-bounce" />
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                EMERGENCY DECLARED
              </h1>
              <p className="text-2xl sm:text-3xl text-red-200 mt-4 font-bold tracking-widest">
                ALERTING ALL STAFF
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
