import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Video, Flame, DoorOpen, Route, Trophy } from "lucide-react"

export default function InstructionsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const steps = [
    { title: t("identifyHazardStep"), key: "instruction1", detail: "instruction2", icon: Flame, color: "text-red-500 bg-red-500/10 border-red-500/20" },
    { title: t("selectExitStep"), key: "instruction3", detail: "instruction4", icon: DoorOpen, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { title: t("tracePathStep"), key: "instruction5", detail: "instruction7", icon: Route, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  ]

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            {t("startTraining")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("readProtocolSteps")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <Card key={idx} className="border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${step.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-indigo-600 font-mono text-sm">0{idx + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {t(step.key)}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t(step.detail)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Attempts info card */}
          <Card className="border-indigo-50/50 bg-indigo-50/20 flex flex-col justify-center">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="rounded-full bg-indigo-600/10 p-3 text-indigo-600 border border-indigo-600/10">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-950">{t("evaluationRules")}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("instruction6")}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("finalScoreDescription")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorial Card */}
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="p-4 bg-slate-50 border-b flex flex-row items-center gap-2">
              <Video className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                {t("tutorialVideoGuide")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-950 overflow-hidden relative group">
                <video
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  <source src="/video/tutorial.mp4" type="video/mp4" />
                </video>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 py-6 text-base font-semibold rounded-xl cursor-pointer"
          onClick={() => navigate("/form")}
        >
          {t("startTest")}
        </Button>
      </div>
    </LayoutShell>
  )
}
