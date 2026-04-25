import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import GridBackground from '../components/GridBackground';
import ThemeToggle from '../components/ThemeToggle';
import { UserRound, Link2, ArrowLeft, Video } from 'lucide-react';

const Home = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!name.trim()) return toast.error('Please enter your name');
    const newRoomId = uuidv4();
    localStorage.setItem('name', name);
    localStorage.setItem('roomId', newRoomId);
    navigate(`/room/${newRoomId}/${name}`);
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !url.trim()) return toast.error('Please fill all fields');
    const roomId = url.split('/room')[1].split('/')[1];
    navigate(`/room/${roomId}/${name}`);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <GridBackground />

      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            C
          </div>
          <span className="text-lg font-bold tracking-tight">Connectly</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 animate-fadeIn"
        style={{
          background: 'var(--card-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)' as any,
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          boxShadow: 'var(--shadow-xl)',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}
          >
            <Video size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isJoining ? 'Join a room' : 'Start meeting'}
          </h1>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {isJoining
              ? 'Enter your name and paste the room link'
              : 'Enter your name to create a new room'}
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Your Name
            </label>
            <div className="relative">
              <UserRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                className="input-base pl-9"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !isJoining) handleCreateRoom(); }}
              />
            </div>
          </div>

          {/* Meeting URL (join mode only) */}
          {isJoining && (
            <div className="flex flex-col gap-1.5 animate-fadeInUp">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Room Link
              </label>
              <div className="relative">
                <Link2
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  className="input-base pl-9"
                  placeholder="Paste the meeting URL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {!isJoining ? (
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleCreateRoom}
                className="btn-brand w-full text-center justify-center flex items-center gap-2 py-3"
              >
                Create Room
              </button>
              <button
                onClick={() => setIsJoining(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                Join Existing Room
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleJoinRoom}
                className="btn-brand w-full text-center justify-center flex items-center gap-2 py-3"
              >
                Join Room
              </button>
              <button
                onClick={() => setIsJoining(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </div>
          )}
        </div>

        {/* Divider note */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          No account required · Peer-to-peer encrypted
        </p>
      </div>
    </div>
  );
};

export default Home;
