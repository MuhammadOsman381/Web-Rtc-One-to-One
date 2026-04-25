import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/chat-hero.jpg';
import GridBackground from '../components/GridBackground';
import ThemeToggle from '../components/ThemeToggle';
import LoadingScreen from '../components/LoadingScreen';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

const features = [
  { icon: <Zap size={18} />, label: 'Instant rooms' },
  { icon: <Shield size={18} />, label: 'End-to-end secure' },
  { icon: <Users size={18} />, label: 'No sign-up needed' },
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
        // Still show page after a timeout or on error to not block forever
        setIsLoading(false);
      }
    };
    wakeServer();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <GridBackground />

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            C
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Connectly
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Hero Section ───────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: Text ── */}
          <div className="flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border animate-fadeInUp"
              style={{
                background: 'var(--brand-subtle)',
                borderColor: 'rgba(249,115,22,0.25)',
                color: 'var(--brand)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              WebRTC Powered — Zero latency
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight animate-fadeInUp delay-100"
              style={{ color: 'var(--text-primary)' }}
            >
              Video calls,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                effortlessly
              </span>
              <br />
              connected.
            </h1>

            <p
              className="text-lg max-w-md leading-relaxed animate-fadeInUp delay-200"
              style={{ color: 'var(--text-secondary)' }}
            >
              Create a private room in seconds and connect face-to-face with anyone, anywhere. No accounts, no setup — just share a link.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start animate-fadeInUp delay-300">
              {features.map(f => (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                  style={{
                    background: 'var(--bg-muted)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ color: 'var(--brand)' }}>{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="animate-fadeInUp delay-400">
              <button
                className="btn-brand flex items-center gap-2 text-base px-7 py-3"
                onClick={() => navigate('/room')}
              >
                Get Started
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* ── Right: Image card ── */}
          <div className="flex-1 w-full max-w-lg animate-fadeInUp delay-200">
            <div
              className="relative rounded-2xl overflow-hidden animate-float"
              style={{
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={img}
                alt="Connectly video call"
                className="w-full h-72 sm:h-96 object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-semibold">LIVE</span>
              </div>

              {/* Participants badge */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="glass-card px-4 py-2 rounded-xl" style={{ borderRadius: '0.875rem' }}>
                  <p className="text-white text-xs font-medium opacity-70">Active room</p>
                  <p className="text-white text-sm font-bold">2 participants connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        className="relative z-10 text-center py-6 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Built with WebRTC · © 2026 Connectly
      </footer>
    </div>
  );
}




