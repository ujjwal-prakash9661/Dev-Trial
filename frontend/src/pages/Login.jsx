import React from 'react'

// Animated, polished login page for Dev‑Trial
// - Beautiful gradient background with soft animated blobs
// - Frosted glass card
// - Working "Login with GitHub" button
// - Crisp two‑line value proposition

const Login = () => {
  const handleGithubLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `https://dev-trial-7mpp.onrender.com/api/auth/github`
  }

  const title = 'Dev‑Trial'
  const letters = Array.from(title)

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 flex flex-col">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-sky-400/30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-400/30 to-emerald-400/30 blur-3xl animate-pulse" />

      {/* Top brand bar */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 text-white text-lg shadow-lg shadow-fuchsia-500/30 animate-[popIn_420ms_ease-out]">🚀</span>
          <div className="relative">
            {/* Removed sheen overlay to ensure title is never obscured */}
            <h1 className="relative text-slate-900 text-4xl sm:text-6xl font-extrabold tracking-tight animate-[titlePop_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
              {letters.map((ch, i) => (
                <span
                  key={i}
                  className="inline-block animate-[riseOnce_800ms_ease-out_forwards]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {ch}
                </span>
              ))}
            </h1>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          {/* <a className="hover:text-slate-900 transition-colors" href="#features">Features</a>
          <a className="hover:text-slate-900 transition-colors" href="#how">How it works</a>
          <a className="hover:text-slate-900 transition-colors" href="#faq">FAQ</a> */}
        </div>
      </div>

      {/* Center card */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-3xl rounded-3xl border border-white/60 bg-white/70 p-10 shadow-xl backdrop-blur-md ring-1 ring-slate-200">
          {/* Glow accent */}
          <div className="pointer-events-none absolute inset-x-20 -top-4 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 blur-sm" />

          <div className="flex flex-col items-center py-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping [animation-duration:2s]" />
              <span className="relative -ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Career journaling for developers</span>
            </div>

            <h2 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-3xl font-extrabold leading-tight text-transparent sm:text-4xl">
              Your growth, captured beautifully
            </h2>
            <p className="mt-3 max-w-2xl text-balance text-slate-600">
              Turn daily learnings into a habit and showcase real progress — a journal that evolves into your living portfolio.
            </p>

            <div className="mt-10 flex w-full max-w-md flex-col gap-3">
              <button
                onClick={handleGithubLogin}
                className="cursor-pointer group relative inline-flex items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-white shadow-lg shadow-slate-900/20 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                {/* GitHub icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.43 2.865 8.186 6.839 9.506.5.093.682-.218.682-.486 0-.24-.01-1.037-.014-1.88-2.782.606-3.369-1.19-3.369-1.19-.455-1.158-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.893 1.53 2.343 1.088 2.914.833.091-.648.35-1.089.636-1.34-2.221-.253-4.555-1.115-4.555-4.962 0-1.095.39-1.99 1.029-2.69-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.707.115 2.506.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.69 0 3.857-2.337 4.706-4.565 4.955.359.31.678.92.678 1.854 0 1.338-.012 2.416-.012 2.745 0 .27.18.583.688.484A10.02 10.02 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">Login with GitHub</span>
                <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80 ring-1 ring-white/20">OAuth</span>
              </button>

              {/* Optional placeholders for future providers (disabled) */}
              <button disabled className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white/60 px-6 py-3.5 text-slate-400">
                Google (coming soon)
              </button>
            </div>

            {/* Micro trust bar */}
            <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>No spam. Private by default. You control what’s public.</span>
            </div>
          </div>
        </div>

        {/* Floating deco elements (hidden to avoid extra vertical space on small screens) */}
        <div className="hidden" />
      </div>
    {/* Keyframes for title/emoji animations */}
    <style>{`
      @keyframes riseOnce { 0% { transform: translateY(6px) scale(1.06) rotate(-1deg); opacity: 1 } 60% { transform: translateY(0) scale(1.04) rotate(0deg); opacity: 1 } 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1 } }
      @keyframes titlePop { 0% { transform: scale(1.18); letter-spacing: .02em } 60% { transform: scale(1.03) } 100% { transform: scale(1); letter-spacing: 0 } }
      @keyframes popIn { 0% { transform: scale(.6) rotate(-8deg); opacity: .0 } 60% { transform: scale(1.1) rotate(2deg); opacity: 1 } 100% { transform: scale(1) rotate(0) } }
      @keyframes sheen { 0% { mask: linear-gradient(100deg, transparent 40%, white 50%, transparent 60%) 0 0/300% 100%; } 100% { mask-position: 300% 0; } }
    `}</style>
  </div>
  )
}

export default Login