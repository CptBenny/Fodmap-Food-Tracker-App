export default function Page() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0a0e17] text-white">
      <iframe
        src="/index.html?v=2.9"
        title="IBS & Food Intolerance Tracker"
        className="w-full h-full border-0"
        allow="camera; microphone"
      />
    </main>
  );
}
