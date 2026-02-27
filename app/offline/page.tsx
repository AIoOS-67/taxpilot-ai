"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl block mb-6">&#9992;&#65039;</span>
        <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
        <p className="text-slate-400 mb-6">
          TaxPilot needs an internet connection to process your tax return.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
