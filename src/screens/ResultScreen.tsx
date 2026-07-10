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
import { Separator } from "../components/ui/separator"
import { toast } from "sonner"
import { generateCertificate, shareCertificate } from "../lib/certificate"
import { Trophy, FileDown, CheckCircle, RotateCcw, Home, Calendar, Timer, MoveRight, Flame, Target, Zap, AlertTriangle } from "lucide-react"
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

export default function ResultScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employeeData, testData, resetTest } = useTest()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
    if (isSaving || saved) return
    setIsSaving(true)

    try {
      if (!employeeData.employeeCode) {
        toast.error("Missing employee ID. Please restart from the Employee Form if you refreshed the page.")
        setIsSaving(false)
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

      setSaved(true)
      toast.success(t("saveSuccessMessage") || "Results saved successfully!")
    } catch (err) {
      console.error("Save error:", err)
      toast.error(t("saveErrorMessage") || "Failed to save results")
      setIsSaving(false)
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
        
        {/* Profile Card */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            {employeeData.photo ? (
              <img
                src={employeeData.photo}
                alt="Employee"
                className="h-16 w-16 rounded-full border-2 border-indigo-100 object-cover shadow-sm bg-slate-50"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-600">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{employeeData.name || t("unknownEmployee")}</h2>
              <p className="text-xs text-slate-500 font-semibold">{t("idPrefix", { id: employeeData.employeeCode || "N/A" })}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {t("testDate")}: {new Date(employeeData.testDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Score Card with Radial Gauge */}
        <Card className="border-slate-100 shadow-sm overflow-hidden relative">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-around gap-8 text-center md:text-left">
            
            {/* SVG Radial Gauge */}
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

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("evaluationGrade")}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${grade.color}`}>
                  <Trophy className="h-3.5 w-3.5" />
                  {grade.label}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                {t("reportDesc", { count: testData.attempts.length })}
              </p>

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
            </div>

          </CardContent>
        </Card>

        {/* Attempts Detail Breakdown */}
        {testData.attempts.length > 0 && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t("viewAttempts")}</h3>
              <div className="grid gap-4">
                {testData.attempts.map((attempt, i) => {
                  const acc = getAccuracyLabel(attempt.pathScore?.accuracy, t)
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-indigo-50/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{t("attemptNum", { num: i + 1 })}</span>
                        <Badge className="bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/10 border-0 text-xs font-bold">{attempt.points} pts</Badge>
                      </div>
                      <Separator className="my-3 opacity-50" />
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-400">Hazard Location</p>
                          <p className="font-bold text-slate-700 flex items-center gap-1.5 capitalize">
                            <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                            {N[attempt.hazard]?.name || attempt.hazard}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400">Selected Gate</p>
                          <p className="font-bold text-slate-700 capitalize">{attempt.selectedExit}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky Action Controls */}
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5" onClick={saveResult} disabled={isSaving || saved}>
              <CheckCircle className="h-5 w-5" />
              {isSaving ? t("saving") : saved ? t("saved") : t("saveButton")}
            </Button>

            <Button className="flex-1 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5" variant="secondary" onClick={handleDownloadCertificate}>
              <FileDown className="h-5 w-5 text-indigo-600" />
              Certificate
            </Button>

            <div className="flex flex-1 gap-3">
              <Button className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5" variant="outline" onClick={handleHome}>
                <Home className="h-4 w-4" />
                {t("home")}
              </Button>
              <Button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5" onClick={handlePlayAgain}>
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
