import { Link, useLocation } from 'react-router-dom';
import { Mic2, Sparkles, History, LogOut, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const navLinks = [
    { to: '/prompt-generator', label: 'Prompt Generator', icon: Sparkles },
    { to: '/audio-feedback', label: 'Audio Feedback', icon: Mic2 },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background font-inter text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="https://media.base44.com/images/public/69c040c501b7e16b8b8abd70/cdeb8be9e_WeixinImage_20260322173930_20_35.jpg" alt="Cyanide Music" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-orbitron font-bold text-lg tracking-widest uppercase text-foreground">CYANOTYPE<span className="text-primary">MUSIC</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            {user ? (
              <div className="relative ml-2" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80 transition-all">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {user.full_name?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground">{user.full_name || user.email}</span>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border/60 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-border/40">
                      <p className="text-xs font-medium text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => base44.auth.logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}