import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + 5
      })
    }, 80)
    const timer = setTimeout(() => navigate("/language"), 2000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [navigate])

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden relative"
      style={{ background: "linear-gradient(145deg, #312e81 0%, #1e1b4b 35%, #0f172a 70%, #020617 100%)" }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
      />

      {/* ── TOP: CMR Logo pill ── */}
      <div className="shrink-0 flex justify-center pt-10 sm:pt-14 animate-in fade-in slide-in-from-top-6 duration-700 z-10">
        <div
          className="bg-white rounded-3xl px-10 py-6 shadow-2xl border border-white/10"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        >
          <img src="/cmr-logo.png" alt="CMR Logo" className="h-20 sm:h-24 w-auto object-contain" />
        </div>
      </div>

      {/* ── CENTER: Title & Progress ── */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl sm:text-5xl font-black text-white text-center tracking-tight leading-tight">
          Plant Layout<br />
          <span className="text-indigo-400">Training</span>
        </h1>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300/60 text-center">
          Tetrahedron Manufacturing Services
        </p>

        {/* Progress bar */}
        <div className="mt-12 w-72 space-y-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-75 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #38bdf8)",
                boxShadow: "0 0 10px rgba(99,102,241,0.5)",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold tracking-widest text-indigo-400/50">
            <span>INITIALIZING SYSTEM</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Tetrahedron branding ── */}
      <div className="shrink-0 flex justify-center items-center pb-8 sm:pb-10 z-10 animate-in fade-in duration-1000">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Developed by</span>
          <div className="flex items-center gap-2">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-8 w-auto object-contain" />
            <span className="text-base font-black text-white tracking-tight">Tetrahedron</span>
          </div>
        </div>
      </div>
    </div>
  )
}
