import { Link, useLocation } from 'react-router-dom';
import { Music2, Mic2, Sparkles, History } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();

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
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Music2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">Musecraft<span className="text-primary">AI</span></span>
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
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all">
              Sign In
            </button>
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