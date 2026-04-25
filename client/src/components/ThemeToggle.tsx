import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        relative w-10 h-10 flex items-center justify-center rounded-xl
        bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10
        hover:bg-white/20 dark:hover:bg-white/10
        backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95
        text-slate-700 dark:text-slate-200
      "
    >
      <span className="transition-all duration-300">
        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
      </span>
    </button>
  );
}
