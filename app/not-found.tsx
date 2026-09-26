import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0e17] text-white p-6">
      <h1 className="text-3xl font-bold mb-2">404 - Not Found</h1>
      <p className="text-slate-400 mb-6 text-sm">The requested resource could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
      >
        Return to App
      </Link>
    </main>
  );
}
