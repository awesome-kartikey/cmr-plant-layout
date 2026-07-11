import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { db, storage } from "../lib/firebase"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { toast } from "sonner"
import { generateCertificate, shareCertificate } from "../lib/certificate"
import { Trophy, FileDown, CheckCircle, RotateCcw, Home, Calendar, Flame, Target, Zap, AlertTriangle, XCircle, Loader2, MoveRight } from "lucide-react"
import { N } from "../lib/graph"

function getGradeLabel(score: number, maxScore: number, t: any) {
  if (maxScore === 0) maxScore = 300;
  const percentage = Math.round((score / maxScore) * 100)
  if (percentage >= 90) return { label: t("gradeOutstanding"), color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  if (percentage >= 75) return { label: t("gradeExcellent"), color: "text-green-600 bg-green-50 border-green-200" }
  if (percentage >= 60) return { label: t("gradeVeryGood"), color: "text-sky-600 bg-sky-50 border-sky-200" }
  if (percentage >= 45) return { label: t("gradeAverage"), color: "text-amber-600 bg-amber-50 border-amber-200" }
  return { label: t("gradeNeedsImprovement"), color: "text-red-500 bg-red-50 border-red-200" }
}

function getAccuracyLabel(accuracy: string | undefined, t: any) {
  switch (accuracy) {
    case "excellent": return { label: t("perfectTracing"), color: "bg-emerald-500/10 text-emerald-600 border-0" }
    case "good": return { label: t("goodTracing"), color: "bg-green-500/10 text-green-600 border-0" }
    case "average": return { label: t("moderateDeviation"), color: "bg-amber-500/10 text-amber-600 border-0" }
    default: return { label: t("highDeviation"), color: "bg-red-500/10 text-red-600 border-0" }
  }
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

export default function ResultScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employeeData, testData, resetTest } = useTest()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  const initials = (employeeData.name || "NA").substring(0, 2).toUpperCase()
  const maxScore = testData.attempts.length > 0 ? testData.attempts.length * 100 : 300
  const grade = getGradeLabel(testData.score, maxScore, t)
  const percentage = Math.min(100, Math.max(0, Math.round((testData.score / maxScore) * 100)))
  
  // Calculate Strengths & Weaknesses
  let strength = { icon: Target, label: t("strengthGoodAttempt"), desc: t("strengthGoodAttemptDesc") }
  let weakness = { icon: AlertTriangle, label: t("weaknessPathTrace"), desc: t("weaknessPathTraceDesc") }
  
  if (testData.attempts.length > 0) {
    const perfectExits = testData.attempts.filter(a => a.points >= 20 || (a.selectedExit === a.nearestExit)).length
    const avgDeviation = testData.attempts.reduce((sum, a) => sum + (a.pathScore?.deviation || 0), 0) / testData.attempts.length
    const avgTime = testData.attempts.reduce((sum, a) => sum + (a.pathScore?.time || 0), 0) / testData.attempts.length

    if (perfectExits === testData.attempts.length) {
      strength = { icon: CheckCircle, label: t("strengthFlawlessGate"), desc: t("strengthFlawlessGateDesc") }
    } else if (avgTime < 5000) {
      strength = { icon: Zap, label: t("strengthFastDecision"), desc: t("strengthFastDecisionDesc") }
    }

    if (perfectExits < testData.attempts.length) {
      weakness = { icon: AlertTriangle, label: t("weaknessSuboptimalGate"), desc: t("weaknessSuboptimalGateDesc") }
    } else if (avgDeviation > 10) {
      weakness = { icon: MoveRight, label: t("weaknessPathTrace"), desc: t("weaknessPathTraceDesc") }
    } else {
      weakness = { icon: Trophy, label: t("weaknessNoMajor"), desc: t("weaknessNoMajorDesc") }
    }
  }

  // Radial Progress math: radius 60, circ = 377
  const strokeDashoffset = 377 - (377 * percentage) / 100

  const saveResult = async () => {
    if (saveStatus === "saving" || saveStatus === "saved") return
    setSaveStatus("saving")

    try {
      if (!employeeData.employeeCode) {
        toast.error("Missing employee ID. Please restart from the Employee Form if you refreshed the page.")
        setSaveStatus("error")
        return
      }

      const employeeCode = employeeData.employeeCode.trim()
      const employeeRef = doc(db, "PlantLayout", employeeCode)

      let photoUrl = employeeData.photoUrl ?? null
      if (!photoUrl && employeeData.photo) {
        const storageRef = ref(storage, `employees/${employeeCode}/profile.jpg`)
        await uploadString(storageRef, employeeData.photo, "data_url")
        photoUrl = await getDownloadURL(storageRef)
      }

      await setDoc(employeeRef, {
        name: employeeData.name,
        employeeCode,
        testDate: employeeData.testDate.toISOString(),
        photoUrl: photoUrl ?? null,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      await addDoc(collection(employeeRef, "Results"), {
        score: testData.score,
        totalAttempts: testData.totalAttempts,
        attempts: testData.attempts,
        createdAt: serverTimestamp(),
      })

      setSaveStatus("saved")
      toast.success(t("saveSuccessMessage") || "Results saved successfully!")
    } catch (err) {
      console.error("Save error:", err)
      toast.error(t("saveErrorMessage") || "Failed to save results")
      setSaveStatus("error")
    }
  }

  const hasSavedRef = useRef(false);
  useEffect(() => {
    if (!hasSavedRef.current && testData.attempts.length > 0) {
      hasSavedRef.current = true;
      saveResult();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save status chip helper
  const SaveStatusChip = () => {
    if (saveStatus === "saving") return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving results…
      </span>
    )
    if (saveStatus === "saved") return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
        <CheckCircle className="h-3.5 w-3.5" />
        Results saved
      </span>
    )
    if (saveStatus === "error") {
      const isMissingId = !employeeData.employeeCode;
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1 cursor-pointer" 
          onClick={isMissingId ? () => navigate("/form") : saveResult}
        >
          <XCircle className="h-3.5 w-3.5" />
          {isMissingId ? "Missing ID — Tap to add" : "Save failed — tap to retry"}
        </span>
      )
    }
    return null
  }

  const handleDownloadCertificate = () => {
    const doc = generateCertificate(employeeData, testData)
    shareCertificate(doc, `certificate-${employeeData.employeeCode}.pdf`)
  }

  const handlePlayAgain = () => {
    resetTest()
    navigate("/training")
  }

  const handleHome = () => {
    navigate("/home")
  }

  return (
    <LayoutShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-40 select-none">
        
        {/* Combined Profile & Score Card */}
        <Card className="border-slate-100 shadow-sm overflow-hidden relative">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                {employeeData.photo ? (
                  <img
                    src={employeeData.photo}
                    alt="Employee"
                    className="h-20 w-20 rounded-full border-4 border-indigo-50 object-cover shadow-sm bg-slate-50"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-600">
                    {initials}
                  </div>
                )}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800">{employeeData.name || t("unknownEmployee")}</h2>
                  <p className="text-sm text-slate-500 font-semibold">{t("idPrefix", { id: employeeData.employeeCode || "N/A" })}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(employeeData.testDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Score Gauge */}
              <div className="relative flex items-center justify-center h-44 w-44 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Ring */}
                  <circle cx="88" cy="88" r="60" stroke="#f1f5f9" strokeWidth="11" fill="transparent" />
                  {/* Glowing Progress */}
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="60" 
                    stroke="url(#radial-gradient)" 
                    strokeWidth="11" 
                    fill="transparent"
                    strokeDasharray="377"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  <defs>
                    <linearGradient id="radial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{testData.score}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {maxScore} pts</span>
                </div>
              </div>
            </div>

            {/* Evaluation Grade */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-6 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t("evaluationGrade")}</p>
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${grade.color}`}>
                <Trophy className="h-6 w-6" />
                <span className="text-2xl font-black">{grade.label}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                {t("reportDesc", { count: testData.attempts.length })}
              </p>
            </div>

            {/* Strengths and Weaknesses */}
            {testData.attempts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <strength.icon className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">{t("topStrength")}</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700">{strength.label}</p>
                    <p className="text-[10px] text-emerald-600/80 mt-0.5">{strength.desc}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <weakness.icon className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-800">{t("areaForGrowth")}</span>
                    </div>
                    <p className="text-xs font-semibold text-amber-700">{weakness.label}</p>
                    <p className="text-[10px] text-amber-600/80 mt-0.5">{weakness.desc}</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Attempts Detail Breakdown */}
        {testData.attempts.length > 0 && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t("viewAttempts")}</h3>
                <span className="text-xs text-slate-400 font-medium">{testData.attempts.length} attempts</span>
              </div>
              <div className="grid gap-3">
                {testData.attempts.map((attempt, i) => {
                  const acc = getAccuracyLabel(attempt.pathScore?.accuracy, t)
                  const isNearestGate = attempt.nearestExit === "Nearest Gate"
                  const timeSec = attempt.pathScore?.time ? (attempt.pathScore.time / 1000).toFixed(1) : null
                  const deviation = attempt.pathScore?.deviation ? Math.round(attempt.pathScore.deviation) : null
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all">
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-[10px] font-black">{i + 1}</span>
                          <span className="text-sm font-bold text-slate-700">{t("attemptNum", { num: i + 1 })}</span>
                        </div>
                        <Badge className="bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/10 border-0 text-xs font-black">{attempt.points} / 100 pts</Badge>
                      </div>

                      {/* Hazard row */}
                      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-orange-50 border border-orange-100">
                        <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">Hazard Location</p>
                          <p className="text-xs font-bold text-orange-700">{N[attempt.hazard]?.name || attempt.hazard}</p>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Gate selection */}
                        <div className={`p-2 rounded-lg border text-center ${
                          isNearestGate
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-red-50 border-red-100"
                        }`}>
                          <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5 text-slate-400">Gate Choice</p>
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-black ${
                            isNearestGate ? "text-emerald-700" : "text-red-600"
                          }`}>
                            {isNearestGate
                              ? <><CheckCircle className="h-3 w-3" /> Nearest</>  
                              : <><AlertTriangle className="h-3 w-3" /> Further</>}
                          </span>
                        </div>

                        {/* Path accuracy */}
                        <div className={`p-2 rounded-lg border text-center ${acc.color.replace('border-0','').trim() || 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5 text-slate-400">Path Quality</p>
                          <span className={`text-[10px] font-black ${acc.color.includes('emerald') ? 'text-emerald-700' : acc.color.includes('green') ? 'text-green-700' : acc.color.includes('amber') ? 'text-amber-700' : 'text-red-600'}`}>
                            {acc.label}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 text-center">
                          <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5 text-slate-400">Draw Time</p>
                          <span className="text-[10px] font-black text-sky-700">
                            {timeSec ? `${timeSec}s` : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Deviation bar */}
                      {deviation !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Path Deviation</p>
                            <p className="text-[9px] font-bold text-slate-500">{deviation}px</p>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                deviation < 5 ? 'bg-emerald-400' : deviation < 15 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(100, (deviation / 30) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky Action Controls */}
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Save status banner */}
            <div className="flex justify-center">
              <SaveStatusChip />
            </div>
            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer py-5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5"
                onClick={handleDownloadCertificate}
              >
                <FileDown className="h-5 w-5" />
                Certificate
              </Button>

              <Button
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer py-5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5"
                variant="outline"
                onClick={handleHome}
              >
                <Home className="h-4 w-4" />
                {t("home")}
              </Button>

              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5"
                onClick={handlePlayAgain}
              >
                <RotateCcw className="h-4 w-4" />
                Retake Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
