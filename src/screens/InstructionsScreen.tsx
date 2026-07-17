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
  const { testData } = useTest()

  const steps = [
    { title: t("identifyHazardStep"), key: "instruction1", detail: "instruction2" },
    { title: t("selectExitStep"), key: "instruction3", detail: "instruction4" },
    { title: t("tracePathStep"), key: "instruction5", detail: "instruction7" },
  ]

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 w-full px-4 md:px-8">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800">
            {t("startTraining")}
          </h1>
          <p className="text-xl md:text-2xl text-slate-500">
            {t("readProtocolSteps")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            return (
              <Card key={idx} className="border-slate-200 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-8 flex items-start gap-4">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                      <span className="text-indigo-600 font-mono text-2xl bg-indigo-50 px-3 py-1.5 rounded-lg">0{idx + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-2xl text-slate-800 leading-relaxed font-bold">
                      {t(step.key)}
                    </p>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium">
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
          <Card className="border-indigo-100 shadow-md bg-indigo-50/40 flex flex-col justify-center">
            <CardContent className="p-8 flex items-start gap-5">
              <div className="rounded-2xl bg-indigo-600/10 p-4 text-indigo-600 border-2 border-indigo-600/20">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-indigo-950">{t("evaluationRules")}</h4>
                <p className="text-2xl text-slate-800 leading-relaxed font-bold">
                  {t("instruction6", { count: testData.totalAttempts })}
                </p>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  {t("finalScoreDescription", { count: testData.totalAttempts, maxScore: testData.totalAttempts * 100 })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorial Card */}
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="p-4 bg-slate-50 border-b flex flex-row items-center gap-2">
              <Video className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-lg md:text-xl font-bold text-slate-800">
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
                  <source src="/video/cmr-plant-layout-tutorial-with-audio.mp4" type="video/mp4" />
                </video>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 py-8 text-xl md:text-2xl font-bold rounded-xl cursor-pointer"
          onClick={() => navigate("/form")}
        >
          {t("startTest")}
        </Button>
      </div>
    </LayoutShell>
  )
}
