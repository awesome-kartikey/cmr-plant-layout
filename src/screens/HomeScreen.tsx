import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { generateCertificate, shareCertificate } from "../lib/certificate"
import { Users, Award, ShieldAlert, CheckCircle2, ChevronRight, FileDown, Search, ArrowRight, Activity, Calendar, Download } from "lucide-react"

interface AttemptDetail {
  hazard: string
  nearestExit: string
  selectedExit: string
  points: number
  pathScore?: {
    score: number
    deviation: number
    time: number
    accuracy: "excellent" | "good" | "average" | "poor"
  }
}

interface ResultItem {
  id: string
  employeeDetails?: { name?: string; employeeCode?: string; photoUrl?: string }
  score?: number
  totalAttempts?: number
  attempts?: AttemptDetail[]
  createdAt?: { toDate: () => Date }
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  
  const [results, setResults] = useState<ResultItem[]>([])
  const [filtered, setFiltered] = useState<ResultItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "PlantLayout"))
      const items: ResultItem[] = []
      for (const doc of snap.docs) {
        const details = doc.data()
        const resultsSnap = await getDocs(
          query(collection(doc.ref, "Results"), orderBy("createdAt", "desc"), limit(1))
        )
        resultsSnap.forEach((r) => {
          items.push({ 
            id: r.id, 
            employeeDetails: details as ResultItem["employeeDetails"], 
            ...r.data() 
          })
        })
      }
      setResults(items)
      setFiltered(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { 
    fetchData() 
  }, [fetchData])

  useEffect(() => {
    if (!search.trim()) { setFiltered(results); return }
    const q = search.toLowerCase()
    setFiltered(results.filter((r) => {
      const name = (r.employeeDetails?.name || "").toLowerCase()
      const code = (r.employeeDetails?.employeeCode || "").toLowerCase()
      return name.includes(q) || code.includes(q)
    }))
  }, [search, results])

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const handleDownloadCertificate = (item: ResultItem) => {
    if (!item.employeeDetails) return
    const mockEmployeeData = {
      name: item.employeeDetails.name || "",
      employeeCode: item.employeeDetails.employeeCode || "",
      testDate: item.createdAt ? item.createdAt.toDate() : new Date(),
      photo: item.employeeDetails.photoUrl || null,
      photoUrl: item.employeeDetails.photoUrl || null
    }
    const mockTestData = {
      score: item.score ?? 0,
      totalAttempts: item.totalAttempts ?? 3,
      attempts: item.attempts ?? []
    }
    const docPdf = generateCertificate(mockEmployeeData, mockTestData)
    shareCertificate(docPdf, `certificate-${item.employeeDetails.employeeCode}.pdf`)
  }

  const handleDownloadCSV = async () => {
    if (results.length === 0) return

    const headers = ["Name", "Employee ID", "Date", "Score", "Max Score", "Percentage"]
    const rows = results.map(item => {
      const max = Math.max(100, (item.attempts?.length || 3) * 100)
      const score = item.score ?? 0
      const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)))
      const date = item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : ""
      return `"${item.employeeDetails?.name || "NA"}","${item.employeeDetails?.employeeCode || "NA"}","${date}",${score},${max},"${percentage}%"`
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    
    // Check if Web Share API is available and can share files
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "plant_layout_results.csv", { type: "text/csv" })
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Plant Layout Assessment Results',
            files: [file]
          })
          return
        }
      } catch (err) {
        console.error("Share failed", err)
      }
    }
    
    // Fallback for desktop/unsupported browsers
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "plant_layout_results.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!user) return null

  // Calculate statistics using percentages
  const totalTrainees = results.length
  
  const resultStats = results.map(r => {
    const max = Math.max(100, (r.attempts?.length || 3) * 100)
    const pct = Math.min(100, Math.max(0, Math.round(((r.score ?? 0) / max) * 100)))
    return pct
  })

  const averageScore = totalTrainees > 0 
    ? Math.round(resultStats.reduce((acc, pct) => acc + pct, 0) / totalTrainees) 
    : 0
  const passRate = totalTrainees > 0
    ? Math.round((resultStats.filter(pct => pct >= 60).length / totalTrainees) * 100)
    : 0
  const highestScore = results.length > 0
    ? Math.max(...resultStats)
    : 0

  return (
    <LayoutShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Banner with Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600/80 uppercase tracking-wider">{t("trainees")}</p>
                <h3 className="text-2xl font-bold text-indigo-900 mt-1">{totalTrainees}</h3>
              </div>
              <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600/80 uppercase tracking-wider">{t("avgScore")}</p>
                <h3 className="text-2xl font-bold text-emerald-900 mt-1">{averageScore}%</h3>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
                <Award className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-50 to-sky-100/50 border-sky-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-sky-600/80 uppercase tracking-wider">{t("passRate")}</p>
                <h3 className="text-2xl font-bold text-sky-900 mt-1">{passRate}%</h3>
              </div>
              <div className="rounded-lg bg-sky-500/10 p-2.5 text-sky-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600/80 uppercase tracking-wider">{t("highScore")}</p>
                <h3 className="text-2xl font-bold text-purple-900 mt-1">{highestScore}%</h3>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Training CTA Card */}
        <Card className="border-indigo-100 overflow-hidden shadow-md relative">
          <div className="absolute right-0 top-0 w-32 h-full bg-indigo-600/5 rounded-l-full blur-xl pointer-events-none" />
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{t("launchAssessment")}</h2>
              <p className="text-sm text-slate-500">{t("launchAssessmentDesc")}</p>
            </div>
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 px-8 py-6 font-semibold rounded-xl shrink-0 group cursor-pointer"
              onClick={() => navigate("/instructions")}
            >
              {t("startTest")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Results list Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>{t("employeeTestResults")}</span>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {filtered.length}
                </span>
              </h2>
              <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-8 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-slate-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-3">
              {filtered.map((item) => {
                const max = Math.max(100, (item.attempts?.length || 3) * 100)
                const score = item.score ?? 0
                const pct = Math.min(100, Math.max(0, Math.round((score / max) * 100)))
                const isPassed = pct >= 60

                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedResult(item)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xs transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {item.employeeDetails?.photoUrl ? (
                        <img 
                          src={item.employeeDetails.photoUrl} 
                          alt={item.employeeDetails.name} 
                          className="h-11 w-11 rounded-full object-cover border border-slate-100" 
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                          {(item.employeeDetails?.name || "NA").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {item.employeeDetails?.name || t("unknownEmployee")}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t("idPrefix", { id: item.employeeDetails?.employeeCode || "N/A" })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-lg font-extrabold ${isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                          {pct}%
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold mb-0.5">
                          {score} / {max} pts
                        </p>
                        <p className="text-[10px] text-slate-400/80">
                          {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 transition-all duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed border-slate-200">
              <CardContent className="py-12 text-center text-slate-400">
                <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                {search ? (
                  <p>{t("noResultsFor", { query: search })}</p>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-slate-600">{t("noResults")}</p>
                    <p className="text-sm">{t("completeTestNote")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed result dialog */}
        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-lg bg-white border border-slate-100 rounded-2xl p-6">
            {selectedResult && (
              <>
                <DialogHeader className="border-b pb-4 mb-4">
                  <DialogTitle className="text-xl font-bold text-slate-800 flex items-center justify-between">
                    <span>{t("assessmentDetail")}</span>
                    <Badge className={((selectedResult.score ?? 0) >= 180) ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-0" : "bg-red-500/10 text-red-600 hover:bg-red-500/10 border-0"}>
                      {((selectedResult.score ?? 0) >= 180) ? t("badgePassed") : t("badgeFailed")}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    {t("assessmentDetailDesc")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                  {/* Profile Summary */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                    {selectedResult.employeeDetails?.photoUrl ? (
                      <img 
                        src={selectedResult.employeeDetails.photoUrl} 
                        alt={selectedResult.employeeDetails.name} 
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" 
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                        {(selectedResult.employeeDetails?.name || "NA").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-800">{selectedResult.employeeDetails?.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{t("employeeCodeLabelShort")}: {selectedResult.employeeDetails?.employeeCode}</p>
                      {selectedResult.createdAt && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedResult.createdAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-3xl font-extrabold text-indigo-600">{selectedResult.score}</span>
                      <span className="text-xs text-slate-400"> / 300</span>
                      <p className="text-[10px] text-indigo-600/80 font-bold uppercase tracking-wider">{t("totalScore")}</p>
                    </div>
                  </div>

                  {/* Attempts list */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("breakdownTitle")}</h5>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedResult.attempts?.map((attempt, index) => (
                        <div key={index} className="border border-slate-100 rounded-xl p-3 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">{t("attemptNum", { num: index + 1 })}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{attempt.points} pts</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-50">
                            <div>
                              <span className="text-slate-400">{t("hazardConfirmedLabel")}: </span>
                              <span className="font-semibold text-slate-700 capitalize">{attempt.hazard}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">{t("selectedExitLabel")}: </span>
                              <span className="font-semibold text-slate-700">{attempt.selectedExit}</span>
                            </div>
                            {attempt.pathScore && (
                              <>
                                <div>
                                  <span className="text-slate-400">{t("pathAccuracyLabel")}: </span>
                                  <span className="font-semibold text-slate-700 capitalize">{attempt.pathScore.accuracy}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">{t("pathDeviationLabel")}: </span>
                                  <span className="font-semibold text-slate-700">{Math.round(attempt.pathScore.deviation)}px</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">{t("drawingTimeLabel")}: </span>
                                  <span className="font-semibold text-slate-700">{(attempt.pathScore.time / 1000).toFixed(1)}s</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6 border-t pt-4 flex items-center justify-between gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadCertificate(selectedResult)}
                    className="border-indigo-100 text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-700 w-full sm:w-auto font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" />
                    {t("downloadCertificate")}
                  </Button>
                  <Button 
                    onClick={() => setSelectedResult(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-full sm:w-auto font-medium rounded-xl border-0 cursor-pointer"
                  >
                    {t("closeWindow")}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutShell>
  )
}
