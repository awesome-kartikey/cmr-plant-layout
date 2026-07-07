import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/button"
import { useInstallPrompt } from "../../hooks/useInstallPrompt"
import { Download } from "lucide-react"
interface LayoutShellProps {
  children: ReactNode
  showHeader?: boolean
}

export function LayoutShell({ children, showHeader = true }: LayoutShellProps) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isInstallable, promptInstall } = useInstallPrompt()

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
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2.5">
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
              {isInstallable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={promptInstall}
                  className="flex items-center gap-1.5 bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:text-white transition-colors h-7 px-3 text-xs shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </Button>
              )}
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
      <main className="mx-auto max-w-[1440px] px-2 md:px-4 pt-3 pb-6">{children}</main>
    </div>
  )
}
