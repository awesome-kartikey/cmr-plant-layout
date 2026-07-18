import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, Mail, Play, ShieldCheck, KeyRound } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "../components/ui/alert-dialog"

export default function LoginScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    if (user && !authLoading) navigate("/home")
  }, [user, authLoading, navigate])

  const handleLogin = async () => {
    if (!email || !password) { toast.error(t("alertErrorFillAll")); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success(t("alertWelcomeBack", { email }))
      navigate("/home")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/user-not-found") toast.error(t("alertErrorUserNotFound"))
      else if (code === "auth/wrong-password") toast.error(t("alertErrorWrongPassword"))
      else if (code === "auth/invalid-email") toast.error(t("alertErrorInvalidEmail"))
      else toast.error(t("alertErrorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error(t("alertErrorFillAll") || "Please enter your email.")
      return
    }
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast.success("Password reset email sent. Check your inbox.")
      setShowForgotModal(false)
      setResetEmail("")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/user-not-found") toast.error(t("alertErrorUserNotFound"))
      else if (code === "auth/invalid-email") toast.error(t("alertErrorInvalidEmail"))
      else toast.error(t("alertErrorGeneric") || "An error occurred.")
    } finally {
      setResetLoading(false)
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
    // h-screen + overflow-hidden = strict viewport lock, zero scrollbars
    <div className="flex h-screen w-full overflow-hidden">

      {/* ── LEFT BRAND PANEL (desktop only) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] xl:w-[40%] shrink-0 p-8 xl:p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #312e81 0%, #1e1b4b 35%, #0f172a 70%, #020617 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }} />

        {/* Top: CMR Logo */}
        <div className="shrink-0 z-10">
          <div className="inline-flex bg-white rounded-2xl px-6 py-4 shadow-2xl shadow-black/40">
            <img src="/cmr-logo.png" alt="CMR" className="h-12 xl:h-14 w-auto object-contain" />
          </div>
        </div>

        {/* Center: Headline */}
        <div className="z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30">
              <ShieldCheck className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent" />
          </div>
          <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
            Plant Layout<br />
            <span className="text-indigo-400">Training</span>
          </h1>
          <p className="text-indigo-200/60 text-sm leading-relaxed max-w-xs">
            Admin portal for managing employee safety assessments and evacuation training results.
          </p>
          <div className="flex flex-col gap-2">
            {["Real-time result tracking", "Certificate generation", "Multi-language support"].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-indigo-200/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tetrahedron branding */}
        <div className="shrink-0 z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 max-w-fit">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Developed by</span>
          <div className="flex items-center gap-2">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-7 w-auto object-contain" />
            <span className="text-sm font-black text-white tracking-tight">Tetrahedron</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      {/* overflow-hidden here: content must fit, no scroll */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">

        {/* Mobile-only top logo strip (shrink-0 = fixed height, never grows) */}
        <div
          className="lg:hidden shrink-0 flex items-center justify-between px-4 py-2.5"
          style={{ background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)" }}
        >
          <div className="bg-white rounded-xl px-4 py-2 shadow-lg">
            <img src="/cmr-logo.png" alt="CMR" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">{t("appName")}</span>
        </div>

        {/* Form area: flex-1 = takes remaining space, centered */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 sm:px-8 py-4 min-h-0">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{t("adminLogin")}</h2>
              <p className="text-slate-500 mt-1 text-sm">Sign in to manage employee training and results</p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5 sm:p-6 space-y-4">

              {/* Email */}
              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 group">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => { setResetEmail(email); setShowForgotModal(true); }}
                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full pl-10 pr-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-500/25"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                >
                  {loading ? t("loginLoading") : t("loginButton")}
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex-1 h-11 rounded-xl font-bold text-slate-600 text-sm border-2 border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  {t("signUpButton")}
                </button>
              </div>
            </div>

            {/* Dev skip */}
            {import.meta.env.DEV && (
              <div className="mt-3">
                <button
                  onClick={() => navigate("/training")}
                  className="w-full h-10 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" /> Skip to Game (Dev Only)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tetrahedron footer (shrink-0 = fixed height) */}
        <div className="lg:hidden shrink-0 flex items-center justify-center gap-3 py-2.5 bg-slate-100/80 border-t border-slate-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Developed by</span>
          <div className="flex items-center gap-1.5">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-5 w-auto object-contain" />
            <span className="text-xs font-bold text-slate-700">Tetrahedron</span>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <AlertDialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <AlertDialogContent className="bg-white border-slate-100 shadow-2xl rounded-2xl p-0 overflow-hidden max-w-sm">
          <div className="bg-indigo-50/50 p-6 pb-4 flex flex-col items-center border-b border-indigo-100/50">
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
              <KeyRound className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Reset Password</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 mt-1">
              Enter your email address and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </div>
          
          <div className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white"
                />
              </div>
            </div>

            <AlertDialogFooter className="flex gap-2 sm:justify-between w-full pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="flex-1 h-10 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading || !resetEmail}
                className="flex-1 h-10 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer text-sm shadow-md shadow-indigo-600/20"
              >
                {resetLoading ? "Sending..." : "Send Link"}
              </button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
