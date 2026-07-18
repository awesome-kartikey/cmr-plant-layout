import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "../lib/i18n"
import { ChevronRight, Globe } from "lucide-react"

export default function LanguageScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelect = (lang: string) => {
    i18n.changeLanguage(lang)
    navigate("/login")
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 relative">
      {/* Decorative background orbs */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
      />

      {/* ── TOP: CMR Logo pill (Wrapped in white container) ── */}
      <div className="shrink-0 flex justify-center pt-10 sm:pt-14 animate-in fade-in slide-in-from-top-6 duration-700 z-10">
        <div className="bg-white rounded-3xl px-10 py-6 border border-slate-100 shadow-xl shadow-slate-200/50">
          <img src="/cmr-logo.png" alt="CMR Logo" className="h-16 sm:h-20 w-auto object-contain" />
        </div>
      </div>

      {/* ── CENTER: Light Language selector card ── */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-5 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl shadow-slate-200/80">
            {/* Globe Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Globe className="h-8 w-8" />
              </div>
            </div>

            <h1 className="mb-8 text-center text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {t("selectLanguage")}
            </h1>

            <div className="grid gap-4">
              {/* English */}
              <button
                onClick={() => handleSelect("en")}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 text-left transition-all duration-300 cursor-pointer bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 border border-indigo-200">
                    <span className="text-base font-black text-indigo-700">EN</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 text-lg sm:text-xl transition-colors group-hover:text-indigo-600">English</p>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">System default language</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>

              {/* Hindi */}
              <button
                onClick={() => handleSelect("hi")}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 p-5 text-left transition-all duration-300 cursor-pointer bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 border border-orange-200">
                    <span className="text-base font-black text-orange-700">HI</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 text-lg sm:text-xl transition-colors group-hover:text-indigo-600">हिंदी</p>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">हिन्दी भाषा का चयन करें</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Tetrahedron branding (Styled for Light Background) ── */}
      <div className="shrink-0 flex justify-center items-center pb-8 sm:pb-10 z-10 animate-in fade-in duration-1000">
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-6 py-3 shadow-md shadow-slate-200/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Developed by</span>
          <div className="flex items-center gap-2">
            <img src="/Tetrahedron-logo-transparent.svg" alt="Tetrahedron Logo" className="h-8 w-auto object-contain filter brightness-90" />
            <span className="text-base font-black text-slate-800 tracking-tight">Tetrahedron</span>
          </div>
        </div>
      </div>
    </div>
  )
}
