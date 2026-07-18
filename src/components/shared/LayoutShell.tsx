import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useInstallPrompt } from "../../hooks/useInstallPrompt"
import { Download, LogOut, Globe } from "lucide-react"

interface LayoutShellProps {
  children: ReactNode
  showHeader?: boolean
  noScroll?: boolean
}

export function LayoutShell({ children, showHeader = true, noScroll = false }: LayoutShellProps) {
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
    <div className={`${noScroll ? "h-screen overflow-hidden flex flex-col" : "min-h-screen"} bg-slate-50`}>
      {showHeader && (
        <header
          className={`text-white shadow-2xl ${noScroll ? "shrink-0" : "sticky top-0"} z-50`}
          style={{ background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)" }}
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 py-3">

            {/* ── Left: Logo + App Name ── */}
            <div className="flex items-center gap-4 shrink-0">
              {/* CMR logo in white pill */}
              <div className="bg-white rounded-xl px-5 py-2.5 shadow-lg shadow-black/20">
                <img src="/cmr-logo.png" alt="CMR" className="h-10 sm:h-12 w-auto object-contain" />
              </div>
              <span className="hidden sm:block text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t("appName")}
              </span>
            </div>

            {/* ── Right: Tetrahedron + user info + controls ── */}
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Tetrahedron branding — visible on tablet/desktop */}
              <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-4 mr-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Developed by</span>
                <div className="flex items-center gap-1.5">
                  <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-6 w-auto object-contain" />
                  <span className="text-xs font-bold text-white tracking-tight">Tetrahedron</span>
                </div>
              </div>

              {/* User email — desktop only */}
              {user && (
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300/60">Admin</span>
                  <span className="text-xs font-semibold text-white/80 max-w-[180px] truncate">{user.email}</span>
                </div>
              )}

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all duration-200 cursor-pointer active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <Globe className="h-3.5 w-3.5 text-indigo-300" />
                {i18n.language === "en" ? "हिंदी" : "English"}
              </button>

              {/* Install App */}
              {isInstallable && (
                <button
                  onClick={promptInstall}
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 shadow-lg shadow-indigo-700/40 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install
                </button>
              )}

              {/* Logout */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-400/30 text-white/70 hover:text-red-300 text-xs font-semibold px-3 py-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`mx-auto max-w-[1440px] w-full px-4 md:px-6 ${noScroll ? "flex-1 flex flex-col overflow-hidden py-4 sm:py-6 min-h-0" : "pt-6 pb-12"}`}>
        {children}
      </main>
    </div>
  )
}
