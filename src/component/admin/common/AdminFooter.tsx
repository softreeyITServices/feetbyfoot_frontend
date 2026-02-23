"use client";

export default function AdminFooter() {
  return (
    <footer className="h-11 border-t border-neutral-200/80 bg-white/60 backdrop-blur-sm flex items-center justify-between px-8 text-[11px] text-neutral-400">
      <span>© {new Date().getFullYear()} FeetByFoot. All rights reserved.</span>

      <div className="flex items-center gap-3">
        <span className="text-neutral-400">v1.0.0</span>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          PROD
        </span>
      </div>
    </footer>
  );
}