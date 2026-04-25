import { useTheme } from '../context/ThemeContext';

export default function GridBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${isDark ? 'bg-grid-dark' : 'bg-grid-light'}`} />
      <div className={`absolute inset-0 ${isDark ? 'bg-grid-fade-dark' : 'bg-grid-fade-light'}`} />

      {/* Ambient blobs */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />
    </div>
  );
}