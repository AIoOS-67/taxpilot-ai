"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "\ud83d\udcca" },
  { href: "/interview", label: "File Taxes", icon: "\ud83d\udcac" },
  { href: "/upload", label: "Upload", icon: "\ud83d\udce4" },
  { href: "/result", label: "Results", icon: "\ud83d\udccb" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">&#9992;&#65039;</span>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TaxPilot
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/trace" className="text-sm text-slate-400 hover:text-white transition-colors">
              Tracing
            </Link>
            <Link href="/review-status" className="text-sm text-slate-400 hover:text-white transition-colors">
              Review
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav className="sticky bottom-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 sm:hidden">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                pathname === item.href
                  ? "text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
