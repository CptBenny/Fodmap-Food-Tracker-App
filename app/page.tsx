'use client';

import {useSyncExternalStore} from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Page() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <main
      suppressHydrationWarning
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#0a0e17] text-white"
    >
      {mounted ? (
        <iframe
          src="/index.html?v=3.5"
          title="FODMAP Food Tracker"
          className="w-full h-full border-0 block"
          allow="camera; microphone"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0e17]">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </main>
  );
}

