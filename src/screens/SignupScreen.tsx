import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../components/ui/alert-dialog"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export default function SignupScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSignUp = async () => {
    if (!name) { setError(t("errorNameRequired")); return }
    if (!email) { setError(t("errorEmailRequired")); return }
    if (!password) { setError(t("errorPasswordRequired")); return }
    if (password.length < 6) { setError(t("errorPasswordLength")); return }

    setLoading(true)
    setError("")
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch {
      setError(t("errorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-indigo-700">
            {t("signupTitle")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("signupSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t("labelFullName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={t("labelEmail")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder={t("labelPassword")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleSignUp} disabled={loading}>
            {loading ? t("buttonSigningUp") : t("buttonSignUp")}
          </Button>
          <p className="text-center text-sm text-gray-500">
            {t("alreadyHaveAccount")}{" "}
            <button
              className="text-indigo-600 hover:underline"
              onClick={() => navigate("/login")}
            >
              {t("loginLink")}
            </button>
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={success} onOpenChange={(o) => { if (!o) navigate("/login") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alertSuccessTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              Account created successfully! Please log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => navigate("/login")}>OK</Button>
        </AlertDialogContent>
      </AlertDialog>

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
