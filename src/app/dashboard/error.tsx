"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong!</h2>
      <p className="text-zinc-400 mb-6 max-w-md">{error.message || "An unexpected error occurred."}</p>
      <button onClick={() => reset()} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
        Try again
      </button>
    </div>
  );
}
