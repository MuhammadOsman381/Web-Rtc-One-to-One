import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GridBackground from '../components/GridBackground';
import ThemeToggle from '../components/ThemeToggle';
import LoadingScreen from '../components/LoadingScreen';
import { ArrowRight, Zap, Shield, Globe, Video, Mic, Share2, PhoneOff } from 'lucide-react';


const features = [
  { icon: <Zap size={18} />, label: 'Instant rooms', desc: 'Connect in under 2 seconds' },
  { icon: <Shield size={18} />, label: 'Peer-to-Peer', desc: 'Securely encrypted data' },
  { icon: <Globe size={18} />, label: 'Global Edge', desc: 'Ultra-low latency connection' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const wakeServer = async () => {
      try {
        await fetch('https://webrtc-backend-qckx.onrender.com/');
        setIsLoading(false);
      } catch (error) {
        console.error('Server wake error:', error);
        setIsLoading(false);
      }
    };
    wakeServer();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-500 overflow-x-hidden">
      <GridBackground />

      <header className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Video size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            Connectly
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-20">
        <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 lg:gap-16 items-center">

          <div className="flex flex-col items-center lg:items-start gap-10 text-center lg:text-left order-2 lg:order-1 mt-12 lg:mt-0">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/20 bg-orange-500/5 text-orange-500 animate-fadeInUp">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                WebRTC Powered Engine
              </div>

              <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fadeInUp delay-100">
                Face-to-face,{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent italic">
                  everywhere.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed animate-fadeInUp delay-200">
                A professional video calling experience that just works. No downloads, no sign-ups — just high-definition, low-latency connection.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 w-full animate-fadeInUp delay-300">
              {features.map(f => (
                <div key={f.label} className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-orange-500">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{f.label}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium leading-tight">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-fadeInUp delay-400">
              <button
                className="btn-brand text-lg px-8 py-4 rounded-2xl w-full sm:w-auto shadow-2xl shadow-orange-500/30"
                onClick={() => navigate('/room')}
              >
                Start Meeting
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>

          {/* ── Right: Live Room Preview ── */}
          <div className="relative order-1 lg:order-2 animate-fadeInUp delay-200 group">
            {/* Visual Container */}
            <div className="relative z-10 w-full aspect-square sm:aspect-video lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden glass-card p-4 border-white/5 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)]">
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden bg-black/40">
                {/* ── Neural Mesh Visualization (No Image) ── */}
                <div className="absolute inset-0 opacity-40">
                  <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {/* Animated Mesh Lines */}
                    <g stroke="url(#meshGradient)" strokeWidth="0.5">
                      {[...Array(15)].map((_, i) => (
                        <line
                          key={`line-${i}`}
                          x1={Math.sin(i) * 400 + 400}
                          y1={Math.cos(i) * 300 + 300}
                          x2={Math.cos(i * 2) * 400 + 400}
                          y2={Math.sin(i * 2) * 300 + 300}
                          className="animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s`, animationDuration: '8s' }}
                        />
                      ))}
                    </g>
                    {/* Floating Connection Points */}
                    {[...Array(25)].map((_, i) => (
                      <circle
                        key={`node-${i}`}
                        cx={((i * 137.5) % 800)}
                        cy={((i * 243.1) % 600)}
                        r={Math.random() * 2 + 1}
                        fill={i % 2 === 0 ? "#f97316" : "#3b82f6"}
                        className="animate-float"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `${5 + (i % 5)}s`
                        }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Floating Participant 1 */}
                <div className="absolute top-10 left-10 p-5 rounded-3xl glass-card border-white/10 animate-float shadow-2xl max-w-[200px] group/card">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 group-hover/card:scale-110 transition-transform">
                      JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[var(--bg-surface)] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">John Doe</h4>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">12ms Latency</span>
                    </div>
                  </div>
                </div>

                {/* Floating Participant 2 */}
                <div className="absolute bottom-1/4 right-10 p-4 rounded-3xl glass-card border-white/10 animate-float shadow-2xl delay-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                      SA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Sarah Al-Farsi</p>
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Broadcasting</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-orange-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  </div>
                </div>

                {/* Real-time Interaction Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card rounded-2xl p-2 flex items-center gap-2 border-white/10 shadow-2xl animate-fadeInUp delay-500">
                  {[
                    { icon: <Mic size={18} />, color: 'bg-white/10' },
                    { icon: <Video size={18} />, color: 'bg-white/10' },
                    { icon: <Share2 size={18} />, color: 'bg-white/10' },
                    { icon: <PhoneOff size={18} />, color: 'bg-red-500' },
                  ].map((item, i) => (
                    <button key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${item.color} hover:scale-110 active:scale-95 transition-all`}>
                      {item.icon}
                    </button>
                  ))}
                </div>

                {/* Network State Indicators */}
                <div className="absolute top-10 right-10 flex flex-col gap-3 items-end">
                  <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">AES-256 Secure</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">60 FPS · 4K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Glows */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] group-hover:bg-orange-500/20 transition-colors" />
            <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] group-hover:bg-blue-500/20 transition-colors" />
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-overlay)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Video size={18} />
            <p className="text-sm font-bold tracking-tight">Connectly © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}




