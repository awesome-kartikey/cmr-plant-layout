import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Video, Trophy } from "lucide-react"

export default function InstructionsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { testData, resetAll } = useTest()

  const steps = [
    { title: t("identifyHazardStep"), key: "instruction1", detail: "instruction2" },
    { title: t("selectExitStep"), key: "instruction3", detail: "instruction4" },
    { title: t("tracePathStep"), key: "instruction5", detail: "instruction7" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <LayoutShell>
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 w-full px-4 md:px-8 py-4">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800">
              {t("startTraining")}
            </h1>
            <p className="text-base md:text-lg text-slate-500 font-medium">
              {t("readProtocolSteps")}
            </p>
          </div>

          {/* Steps Stack (Full-width Horizontal Cards) */}
          <div className="flex flex-col gap-5">
            {steps.map((step, idx) => {
              return (
                <Card key={idx} className="border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center hover:shadow-md transition-all duration-300 bg-white p-6 sm:p-8 gap-6">
                  {/* Left Side: Step Badge */}
                  <div className="shrink-0 flex items-center md:justify-center">
                    <span className="text-sm sm:text-base font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-2.5 shadow-sm">
                      Step 0{idx + 1}
                    </span>
                  </div>

                  {/* Right Side: Large Text Details */}
                  <div className="flex-1 space-y-2 md:space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-bold">
                      {t(step.key)}
                    </p>
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                      {t(step.detail)}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Rules and Video Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Attempts info card */}
            <Card className="border-indigo-100/80 shadow-sm bg-indigo-50/20 flex flex-col justify-center">
              <CardContent className="p-6 sm:p-8 flex items-start gap-4">
                <div className="rounded-xl bg-indigo-600/10 p-3 text-indigo-600 border border-indigo-600/20 shrink-0">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl sm:text-3xl font-black text-indigo-950">{t("evaluationRules")}</h4>
                  <p className="text-xl sm:text-2xl text-slate-800 leading-relaxed font-black">
                    {t("instruction6", { count: testData.totalAttempts })}
                  </p>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-semibold">
                    {t("finalScoreDescription", { count: testData.totalAttempts, maxScore: testData.totalAttempts * 100 })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Video Tutorial Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="p-5 bg-slate-50 border-b flex flex-row items-center gap-3">
                <Video className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-xl sm:text-2xl font-black text-slate-800">
                  {t("tutorialVideoGuide")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <div className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-950 overflow-hidden relative group">
                  <video
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    <source src="/video/cmr-plant-layout-tutorial-with-audio.mp4" type="video/mp4" />
                  </video>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 h-16 sm:h-20 text-2xl sm:text-3xl font-black rounded-xl cursor-pointer transition-all active:scale-[0.99] py-6"
            onClick={() => {
              resetAll()
              navigate("/form")
            }}
          >
            {t("startTest")}
          </Button>
        </div>
      </LayoutShell>
    </div>
  )
}
