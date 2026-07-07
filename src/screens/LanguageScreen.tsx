import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "../lib/i18n"
import { Languages } from "lucide-react"

export default function LanguageScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelect = (lang: string) => {
    i18n.changeLanguage(lang)
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white/80 p-8 backdrop-blur-xl shadow-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-indigo-500/10 p-4 border border-indigo-500/20 text-indigo-600">
            <Languages className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-slate-800">
          {t("selectLanguage")}
        </h1>
        
        <div className="grid gap-4">
          <button
            onClick={() => handleSelect("en")}
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all duration-300 hover:border-indigo-500/30 hover:bg-white hover:shadow-md cursor-pointer animate-in fade-in zoom-in-95 duration-500"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">English</p>
                <p className="text-xs text-slate-400">System default language</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
              Select →
            </span>
          </button>

          <button
            onClick={() => handleSelect("hi")}
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition-all duration-300 hover:border-indigo-500/30 hover:bg-white hover:shadow-md cursor-pointer animate-in fade-in zoom-in-95 duration-500"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">हिंदी</p>
                <p className="text-xs text-slate-400">हिन्दी भाषा का चयन करें</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
              चुनें →
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
