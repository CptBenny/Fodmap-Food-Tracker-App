'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e17] text-white">
        <main className="fixed inset-0 flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-400 text-sm mb-4">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
