import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react"

export default function SignupScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !authLoading) navigate("/home")
  }, [user, authLoading, navigate])

  const handleSignUp = async () => {
    if (!name) { toast.error(t("errorNameRequired")); return }
    if (!email) { toast.error(t("errorEmailRequired")); return }
    if (!password) { toast.error(t("errorPasswordRequired")); return }
    if (password.length < 6) { toast.error(t("errorPasswordLength")); return }

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      })
      toast.success(t("alertSuccessTitle") + ": Account created successfully!")
      navigate("/login")
    } catch {
      toast.error(t("errorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #000000 100%)" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── LEFT BRAND PANEL ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] shrink-0 p-10 xl:p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #312e81 0%, #1e1b4b 35%, #0f172a 70%, #020617 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }} />

        {/* Top: CMR Logo in white pill */}
        <div className="shrink-0 z-10">
          <div className="inline-flex items-center bg-white rounded-3xl px-8 py-5 shadow-2xl shadow-black/40 border border-white/10">
            <img src="/cmr-logo.png" alt="CMR" className="h-16 sm:h-20 w-auto object-contain" />
          </div>
        </div>

        {/* Center: Headline */}
        <div className="z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
              <UserPlus className="h-6 w-6 text-indigo-300" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Create your<br />
            <span className="text-indigo-400">Admin Account</span>
          </h1>
          <p className="text-indigo-200/60 text-base leading-relaxed max-w-sm">
            Register to gain access to the Plant Layout Training admin portal and manage employee assessments.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {["Secure account creation", "Instant access on signup", "Full admin privileges"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-indigo-200/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tetrahedron branding */}
        <div className="shrink-0 z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 shadow-sm max-w-fit">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Developed by</span>
          <div className="flex items-center gap-2">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-8 w-auto object-contain" />
            <span className="text-lg font-black text-white tracking-tight">Tetrahedron</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex flex-1 flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Mobile-only top strip */}
        <div
          className="lg:hidden flex items-center justify-between px-5 py-4 shrink-0"
          style={{ background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)" }}
        >
          <div className="bg-white rounded-xl px-5 py-2.5 shadow-lg">
            <img src="/cmr-logo.png" alt="CMR" className="h-10 w-auto object-contain" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">{t("appName")}</span>
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-10 py-10">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t("signupTitle")}</h2>
              <p className="text-slate-500 mt-2 text-sm">{t("signupSubtitle")}</p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-7 sm:p-8 space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t("labelFullName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    placeholder={t("labelEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("labelPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                    className="w-full pl-11 pr-12 h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-lg shadow-indigo-500/30"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                >
                  {loading ? t("buttonSigningUp") : t("buttonSignUp")}
                </button>
              </div>

              {/* Login link */}
              <p className="text-center text-sm text-slate-500 pt-1">
                {t("alreadyHaveAccount")}{" "}
                <button
                  className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  {t("loginLink")}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Tetrahedron footer */}
        <div className="lg:hidden shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 text-slate-505 bg-slate-100/50 border-t border-slate-200/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Developed by</span>
          <div className="flex items-center gap-2">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-6 w-auto object-contain" />
            <span className="text-sm font-bold text-slate-800">Tetrahedron</span>
          </div>
        </div>
      </div>
    </div>
  )
}
