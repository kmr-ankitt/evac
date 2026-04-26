"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TaskBoard } from "@/components/TaskBoard";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Incident } from "@/lib/types";

export default function TasksPage() {
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, "activeIncident"), (snap) => {
      setActiveIncident(snap.exists() ? snap.val() : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Task Management</h1>
        {activeIncident ? (
          <TaskBoard incidentId={activeIncident.id} />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
            No active incident. Tasks will appear here when an emergency is declared.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
