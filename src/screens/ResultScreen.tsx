import { useState } from "react"
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
import { Trophy, FileDown, CheckCircle, RotateCcw, Home, Calendar, Timer, MoveRight } from "lucide-react"

function getGradeLabel(score: number) {
  const percentage = Math.round((score / 300) * 100)
  if (percentage >= 90) return { label: "Outstanding (Level 1)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  if (percentage >= 75) return { label: "Excellent (Level 2)", color: "text-green-600 bg-green-50 border-green-200" }
  if (percentage >= 60) return { label: "Very Good (Level 3)", color: "text-sky-600 bg-sky-50 border-sky-200" }
  if (percentage >= 45) return { label: "Average (Level 4)", color: "text-amber-600 bg-amber-50 border-amber-200" }
  return { label: "Needs Improvement", color: "text-red-500 bg-red-50 border-red-200" }
}

function getAccuracyLabel(accuracy?: string) {
  switch (accuracy) {
    case "excellent": return { label: "Perfect Tracing", color: "bg-emerald-500/10 text-emerald-600 border-0" }
    case "good": return { label: "Good Tracing", color: "bg-green-500/10 text-green-600 border-0" }
    case "average": return { label: "Moderate Deviation", color: "bg-amber-500/10 text-amber-600 border-0" }
    default: return { label: "High Deviation", color: "bg-red-500/10 text-red-600 border-0" }
  }
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employeeData, testData, resetTest } = useTest()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = (employeeData.name || "NA").substring(0, 2).toUpperCase()
  const grade = getGradeLabel(testData.score)
  const percentage = Math.min(100, Math.max(0, Math.round((testData.score / 300) * 100)))
  
  // Radial Progress math: radius 60, circ = 377
  const strokeDashoffset = 377 - (377 * percentage) / 100

  const saveResult = async () => {
    if (isSaving || saved) return
    setIsSaving(true)

    try {
      if (!employeeData.employeeCode) {
        toast.error("Missing employee data")
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
      toast.success("Results saved successfully!")
    } catch (err) {
      console.error("Save error:", err)
      toast.error("Failed to save results")
      setIsSaving(false)
    }
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
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 select-none">
        
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
                {t("testDate")}: {new Date(employeeData.testDate).toLocaleDateString()}
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
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ 300 pts</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Grade</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${grade.color}`}>
                  <Trophy className="h-3.5 w-3.5" />
                  {grade.label}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                This report verifies that the employee completed emergency exit planning assessments in {testData.attempts.length} attempts. Grading depends on Dijkstra optimal-path calculations and evacuation gate choices.
              </p>
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
                  const acc = getAccuracyLabel(attempt.pathScore?.accuracy)
                  return (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-indigo-50/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">Attempt {i + 1}</span>
                        <Badge className="bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/10 border-0 text-xs font-bold">{attempt.points} pts</Badge>
                      </div>
                      <Separator className="my-3 opacity-50" />
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-400">Exit Selected</p>
                          <p className="font-bold text-slate-700 flex items-center gap-1.5 capitalize">
                            {attempt.hazard} <MoveRight className="h-3 w-3 text-slate-400" /> {attempt.selectedExit}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400">Exit Evaluation</p>
                          <p className="font-bold text-slate-700 capitalize">{attempt.nearestExit}</p>
                        </div>
                        {attempt.pathScore && (
                          <>
                            <div className="space-y-1">
                              <p className="text-slate-400">Path Quality</p>
                              <Badge className={`px-2 py-0.5 text-[10px] font-bold border ${acc.color}`}>
                                {acc.label}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400">Trace Deviation</p>
                              <p className="font-bold text-slate-700">{Math.round(attempt.pathScore.deviation)}px</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400">Drawing Timer</p>
                              <p className="font-bold text-slate-700 flex items-center gap-1">
                                <Timer className="h-3.5 w-3.5 text-slate-400" />
                                {(attempt.pathScore.time / 1000).toFixed(1)}s
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2" onClick={saveResult} disabled={isSaving || saved}>
            <CheckCircle className="h-5 w-5" />
            {isSaving ? t("saving") : saved ? t("saved") : t("saveButton")}
          </Button>

          <Button className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm" variant="secondary" onClick={handleDownloadCertificate}>
            <FileDown className="h-5 w-5 text-indigo-600" />
            Download Evacuation Certificate
          </Button>

          <div className="flex gap-4">
            <Button className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer py-5 rounded-xl font-bold flex items-center justify-center gap-1.5" variant="outline" onClick={handleHome}>
              <Home className="h-4 w-4" />
              {t("home")}
            </Button>
            <Button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer py-5 rounded-xl font-bold flex items-center justify-center gap-1.5" onClick={handlePlayAgain}>
              <RotateCcw className="h-4 w-4" />
              {t("playAgain")}
            </Button>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}
