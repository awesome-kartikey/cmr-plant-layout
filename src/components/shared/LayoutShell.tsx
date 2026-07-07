import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/button"

interface LayoutShellProps {
  children: ReactNode
  showHeader?: boolean
}

export function LayoutShell({ children, showHeader = true }: LayoutShellProps) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en"
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <header className="bg-indigo-700 text-white shadow-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src="/cmr-logo.png" alt="CMR" className="h-8 w-auto" />
              <span className="text-lg font-bold">{t("appName")}</span>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-indigo-200">{user.email}</span>
              )}
              <button
                onClick={toggleLanguage}
                className="rounded bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
              >
                {i18n.language === "en" ? "हिंदी" : "English"}
              </button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-indigo-600"
                  onClick={handleLogout}
                >
                  {t("logout")}
                </Button>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
