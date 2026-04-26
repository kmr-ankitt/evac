"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffPanel } from "@/components/StaffPanel";
import { EventLog } from "@/components/EventLog";
import { CrisisMap } from "@/components/CrisisMap";
import { TaskBoard } from "@/components/TaskBoard";
import { useFCMToken } from "@/lib/hooks/useFCMToken";
import { Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { collection, addDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Incident } from "@/lib/types";

export default function DashboardPage() {
  useFCMToken(); // Register for push notifications
  const { currentUser, userRole } = useAuth();
  
  // Realtime incident state
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const incidentRef = ref(rtdb, 'activeIncident');
    const unsubscribe = onValue(incidentRef, (snapshot) => {
      if (snapshot.exists()) {
        setActiveIncident(snapshot.val());
      } else {
        setActiveIncident(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Triage state
  const [showTriage, setShowTriage] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  const handleTriageSubmit = async () => {
    if (!userInput.trim()) return;
    setTriageLoading(true);
    try {
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, userRole })
      });
      const data = await res.json();
      if (data.triage) setTriageResult(data.triage);
      else toast.error("Triage failed.");
    } catch (e) {
      toast.error("Error connecting to Triage AI.");
    } finally {
      setTriageLoading(false);
    }
  };

  const handleLogTriage = async () => {
    if (!triageResult || !currentUser) return;
    try {
      await addDoc(collection(db, 'logs'), {
        incidentId: activeIncident?.id || 'general',
        message: `Triage Log: ${triageResult.summary}`,
        actor: currentUser.email,
        actorRole: userRole,
        timestamp: Date.now()
      });
      toast.success("Logged successfully!");
      setShowTriage(false);
      setUserInput("");
      setTriageResult(null);
    } catch (e) {
      toast.error("Failed to log triage.");
    }
  };

  return (
    <ProtectedRoute>
      {/* 3-column Layout */}
      <div className="w-full p-4 lg:p-6" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 h-full overflow-y-auto lg:overflow-hidden pb-16 lg:pb-0">
          
          {/* Left Column: Staff Panel */}
          <div className="h-[400px] lg:h-full">
            <StaffPanel />
          </div>

          {/* Center Column: Map & Log */}
          <div className="flex flex-col gap-4 h-full">
            <div className="shrink-0 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
               <CrisisMap 
                locationString={activeIncident?.location}
                incidentType={activeIncident?.type}
                severity={activeIncident?.severity}
              />
            </div>
            <div className="flex-1 min-h-[240px] rounded-xl overflow-hidden shadow-lg border border-zinc-800">
              <EventLog incidentId={activeIncident?.id || null} />
            </div>
          </div>

          {/* Right Column: Task Board */}
          <div className="h-[500px] lg:h-full">
            <TaskBoard incidentId={activeIncident?.id || null} />
          </div>

        </div>
      </div>

      {/* Triage FAB */}
      <button
        onClick={() => setShowTriage(true)}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-transform hover:scale-110 z-40"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Triage Modal */}
      {showTriage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
              <h2 className="text-xl font-bold text-white">AI Triage Assistant</h2>
              <button onClick={() => setShowTriage(false)} className="text-zinc-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!triageResult ? (
                <div className="space-y-4">
                  <label className="block text-sm text-zinc-400">Describe the situation...</label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-red-500"
                    placeholder="e.g., I smell smoke coming from room 312."
                  />
                  <button
                    onClick={handleTriageSubmit}
                    disabled={!userInput.trim() || triageLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center"
                  >
                    {triageLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Analyze Situation"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Severity</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      triageResult.severity === 'low' ? 'bg-green-500/20 text-green-400' :
                      triageResult.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      triageResult.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {triageResult.severity}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-zinc-400 text-sm mb-1">Classification</h3>
                    <p className="text-white font-medium">{triageResult.classification}</p>
                  </div>

                  <div>
                    <h3 className="text-zinc-400 text-sm mb-2">Immediate Actions</h3>
                    <ol className="list-decimal pl-5 space-y-1 text-zinc-200 text-sm">
                      {triageResult.immediateActions?.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={handleLogTriage}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                  >
                    Log This
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
