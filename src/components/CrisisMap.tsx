"use client";

import { MapPin, AlertTriangle, Flame, Cross, ShieldAlert } from "lucide-react";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  FIRE:     { icon: Flame,        color: "text-orange-400", bg: "border-orange-500 bg-orange-500/20" },
  MEDICAL:  { icon: Cross,        color: "text-green-400",  bg: "border-green-500 bg-green-500/20" },
  DISASTER: { icon: AlertTriangle, color: "text-yellow-400", bg: "border-yellow-500 bg-yellow-500/20" },
  SECURITY: { icon: ShieldAlert,  color: "text-blue-400",   bg: "border-blue-500 bg-blue-500/20" },
};

export const CrisisMap = ({ locationString, incidentType, severity }: {
  locationString?: string;
  incidentType?: string;
  severity?: string;
}) => {
  const cfg = typeConfig[incidentType || ''] || typeConfig['FIRE'];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[320px]">
      {/* Map placeholder */}
      <div className="flex-1 w-full bg-zinc-950 relative flex items-center justify-center">
        {/* Grid background to simulate a map */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#52525b 1px, transparent 1px), linear-gradient(90deg, #52525b 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {locationString ? (
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
            {/* Pulsing rings — fixed size wrapper prevents overflow */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className="absolute w-16 h-16 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-red-500/10 animate-ping [animation-delay:0.4s]" />
              <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center ${cfg.bg}`}>
                <cfg.icon className={`h-6 w-6 ${cfg.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-red-400 font-bold text-sm uppercase tracking-widest">Active Incident</span>
                {severity && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                    severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                    'bg-green-500/20 text-green-400 border-green-500/40'
                  }`}>{severity}</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1 text-zinc-200 font-semibold text-base">
                <MapPin className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                {locationString}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-2 text-zinc-600">
            <MapPin className="h-10 w-10" />
            <span className="text-sm font-medium uppercase tracking-widest">No Active Incident</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-zinc-950 p-2 border-t border-zinc-800 shrink-0 flex justify-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Danger (100m)</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Caution (200m)</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Safe</div>
      </div>
    </div>
  );
};
