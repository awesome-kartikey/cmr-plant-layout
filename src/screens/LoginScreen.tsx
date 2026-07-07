import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../components/ui/alert-dialog"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function LoginScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("alertErrorFillAll"))
      return
    }
    setLoading(true)
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/home")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/user-not-found") setError(t("alertErrorUserNotFound"))
      else if (code === "auth/wrong-password") setError(t("alertErrorWrongPassword"))
      else if (code === "auth/invalid-email") setError(t("alertErrorInvalidEmail"))
      else setError(t("alertErrorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-indigo-700">
            {t("adminLogin")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t("emailPlaceholder")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder={t("passwordPlaceholder")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleLogin} disabled={loading}>
              {loading ? t("loginLoading") : t("loginButton")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/signup")}
            >
              {t("signUpButton")}
            </Button>
          </div>
          {import.meta.env.DEV && (
            <div className="mt-4 border-t pt-4">
              <Button
                variant="secondary"
                className="w-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                onClick={() => navigate("/training")}
              >
                Skip to Game (Dev Only)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError("")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alertErrorTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setError("")}>OK</Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
