import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-base)]">
      <div className="relative flex flex-col items-center gap-6 animate-fadeIn">
        {/* Animated brand logo/icon */}
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
          <span className="text-white text-4xl font-black relative z-10">C</span>
        </div>

        {/* Loading text and spinner */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
               <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
               <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Waking up Connectly
               </h2>
            </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            This may take a few seconds on cold starts...
          </p>
        </div>

        {/* Progress bar simulation */}
        <div className="w-48 h-1 bg-[var(--bg-muted)] rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-[var(--brand)] rounded-full animate-shimmer" 
            style={{ width: '60%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(to right, #f97316 0%, #fb923c 50%, #f97316 100%)' }}
          />
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
    </div>
  );
}
