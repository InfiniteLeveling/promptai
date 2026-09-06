import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Code, X, Mail, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsLoginOpen(false);
      setEmail('');
    }, 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
              PA
            </div>
            <span className="font-headline-sm font-bold text-lg text-on-surface tracking-tight flex items-center gap-1">
              PromptArchitect AI
              <span className="text-[10px] font-code-sm font-bold text-primary border border-primary/30 bg-primary/10 px-1 py-0.2 rounded ml-1">TM</span>
            </span>
          </Link>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/InfiniteLeveling/promptai"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface transition-all"
            >
              <Code className="w-3.5 h-3.5 text-primary" />
              <span>GitHub</span>
              <span className="text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded text-primary font-bold">★ 4.2k</span>
            </a>

            {/* Login Button */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="relative group inline-flex items-center justify-center p-0.5 rounded-full overflow-hidden text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 50%, rgb(6, 182, 212) 100%)'
              }}
            >
              <span className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface group-hover:text-white transition-colors">
                <LogIn className="w-3.5 h-3.5 text-tertiary group-hover:rotate-12 transition-transform duration-300" />
                <span>Login</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center text-surface-container-lowest font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                PA
              </div>
              <h2 className="font-display-hero text-xl font-bold text-on-surface">Welcome to PromptArchitect</h2>
              <p className="text-xs text-on-surface-variant">Sign in to sync your prompt specifications and access custom agent targets.</p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setIsSubmitted(true);
                  setTimeout(() => { setIsSubmitted(false); setIsLoginOpen(false); }, 1200);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/60 hover:bg-surface-container text-xs font-semibold text-on-surface transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => {
                  setIsSubmitted(true);
                  setTimeout(() => { setIsSubmitted(false); setIsLoginOpen(false); }, 1200);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/60 hover:bg-surface-container text-xs font-semibold text-on-surface transition-all"
              >
                <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-outline-variant/20"></div>
              <span className="absolute px-2 text-[10px] font-mono uppercase text-outline bg-surface-container-lowest">or email</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-outline" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-surface-container-lowest font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Continue with Email</span>
                )}
              </button>
            </form>

            <div className="text-center text-[10px] text-outline">
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
