import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
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
    if (user && !authLoading) {
      navigate("/home")
    }
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-sky-600/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-center text-2xl font-extrabold tracking-tight text-slate-800">
            {t("signupTitle")}
          </CardTitle>
          <CardDescription className="text-center text-slate-500 text-sm">
            {t("signupSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("labelFullName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("labelEmail")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("labelPassword")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-6 rounded-xl font-bold" 
            onClick={handleSignUp} 
            disabled={loading}
          >
            {loading ? t("buttonSigningUp") : t("buttonSignUp")}
          </Button>

          <p className="text-center text-sm text-slate-500">
            {t("alreadyHaveAccount")}{" "}
            <button
              className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors cursor-pointer"
              onClick={() => navigate("/login")}
            >
              {t("loginLink")}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
