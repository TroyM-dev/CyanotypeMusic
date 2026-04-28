import { LogIn, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LoginPromptModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          <LogIn className="w-7 h-7 text-primary" />
        </div>

        <h2 className="text-lg font-bold text-foreground mb-2">Sign in to continue</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          You need to be signed in to use this feature. It only takes a moment.
        </p>

        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
        >
          Sign In
        </button>
        <button onClick={onClose} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}