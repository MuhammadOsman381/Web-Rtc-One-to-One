import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import GridBackground from '../components/GridBackground';
import ThemeToggle from '../components/ThemeToggle';
import { UserRound, Link2, ArrowLeft, Video, Plus, Users } from 'lucide-react';

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
    try {
      // Handle both full URLs and just room IDs
      const roomId = url.includes('/room/') ? url.split('/room/')[1].split('/')[0] : url;
      if (!roomId) throw new Error('Invalid room identifier');
      navigate(`/room/${roomId}/${name}`);
    } catch (err) {
      toast.error('Invalid room link or ID');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-500 overflow-hidden">
      <GridBackground />

      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Video size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            Connectly
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6 animate-scaleIn">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-700" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700" />

          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
              {isJoining ? <Users size={32} /> : <Plus size={32} />}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {isJoining ? 'Join Space' : 'New Meeting'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] font-medium max-w-[240px] mx-auto">
                {isJoining
                  ? 'Paste the invitation link below to enter the secure room'
                  : 'Start a high-quality video call instantly with no accounts'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">
                Display Name
              </label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-orange-500 transition-colors">
                  <UserRound size={18} />
                </div>
                <input
                  type="text"
                  className="input-base w-full pl-12 pr-4 py-4 rounded-2xl text-base font-medium"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !isJoining) handleCreateRoom(); }}
                />
              </div>
            </div>

            {isJoining && (
              <div className="space-y-2 animate-fadeInUp">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">
                  Private Link
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/input:text-orange-500 transition-colors">
                    <Link2 size={18} />
                  </div>
                  <input
                    type="text"
                    className="input-base w-full pl-12 pr-4 py-4 rounded-2xl text-base font-medium"
                    placeholder="URL or Room ID"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <button
                onClick={isJoining ? handleJoinRoom : handleCreateRoom}
                className="btn-brand w-full py-3  text-lg rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
              >
                {isJoining ? 'Join Room' : 'Create Room'}
              </button>

              <button
                onClick={() => setIsJoining(!isJoining)}
                className="w-full py-4  rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <ArrowLeft size={16} />
                    Create a new room instead
                  </>
                ) : (
                  'Join with existing link'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 text-center opacity-40 select-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Secure · Private · Real-time</p>
      </div>
    </div>
  );
};

export default Home;
