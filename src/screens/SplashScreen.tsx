import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 80) // 20 steps over 1.6s

    const timer = setTimeout(() => navigate("/language"), 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
        <img 
          src="/cmr-logo.png" 
          alt="CMR Logo" 
          className="mb-8 h-24 w-auto drop-shadow-[0_4px_12px_rgba(99,102,241,0.15)]" 
        />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 via-slate-800 to-indigo-900 tracking-wider">
          Plant Layout Training
        </h1>
        <p className="mt-3 text-xs font-bold text-indigo-600/60 uppercase tracking-[0.25em]">
          Tetrahedron Manufacturing Services
        </p>
        
        {/* Modern Progress Bar */}
        <div className="mt-12 w-64 space-y-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 transition-all duration-75 ease-out shadow-xs" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold tracking-wider text-indigo-600/50">
            <span>INITIALIZING SYSTEM</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
