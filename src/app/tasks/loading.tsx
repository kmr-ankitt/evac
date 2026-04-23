export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
