import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { PlantMap } from "../components/plant-map/PlantMap"
import type { Point } from "../lib/graph"
import { N, ROOMS, dijkstra, ptDist, DEFAULT_GRAPH } from "../lib/graph"
import { Flame, DoorOpen, Route, Timer, Undo2, RotateCcw } from "lucide-react"
import { Button } from "../components/ui/button"

type Phase = "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"

export default function TrainingScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addAttempt, testData, resetTest } = useTest()

  const [phase, setPhase] = useState<Phase>("hazard-confirm")
  const [hazardNode, setHazardNode] = useState<string>("")
  const [selectedExit, setSelectedExit] = useState<string>("")
  const [drawnPath, setDrawnPath] = useState<Point[]>([])
  
  // Scoring / Details
  const [resultTitle, setResultTitle] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultScore, setResultScore] = useState(0)
  const [drawStartTime, setDrawStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  
  useEffect(() => {
    resetTest()
    pickNewHazard()
  }, [])

  useEffect(() => {
    let timer: any
    if (phase === "path-draw") {
      const start = Date.now()
      setDrawStartTime(start)
      setElapsedTime(0)
      timer = setInterval(() => {
        setElapsedTime(Date.now() - start)
      }, 100)
    }
    return () => clearInterval(timer)
  }, [phase])

  const pickNewHazard = () => {
    const room = ROOMS[Math.floor(Math.random() * ROOMS.length)]
    setHazardNode(room.nodeId)
    setSelectedExit("")
    setDrawnPath([])
    setPhase("hazard-confirm")
  }

  const handleHazardConfirmed = () => {
    setPhase("exit-select")
  }

  const handleExitSelected = (exitNode: string) => {
    setSelectedExit(exitNode)
    setDrawnPath([])
    setPhase("path-draw")
  }

  const handlePathComplete = (finalPath: Point[]) => {
    const duration = Date.now() - drawStartTime
    
    // 1. Grade Exit Selection (Max 50 pts)
    const hazardPt = N[hazardNode]
    const exitDistances = ["G1", "G2", "G3"].reduce((acc, ex) => {
      if (N[ex]) {
        const d = Math.sqrt((N[ex].x - hazardPt.x) ** 2 + (N[ex].y - hazardPt.y) ** 2)
        acc[ex] = d
      }
      return acc
    }, {} as Record<string, number>)

    const minD = Math.min(...Object.values(exitDistances))
    const selectedDist = exitDistances[selectedExit]

    // 15% visual tolerance
    const isNearest = selectedDist <= minD * 1.15 || Math.abs(selectedDist - minD) < 50
    const exitScore = isNearest ? 50 : 30

    // 2. Grade Path Traced (Max 50 pts)
    const { dist: shortestPathDist } = dijkstra(N, DEFAULT_GRAPH.adj, selectedExit, "ASSEMBLY")
    
    let userPathDist = 0
    for (let i = 0; i < finalPath.length - 1; i++) {
      userPathDist += ptDist(finalPath[i], finalPath[i+1])
    }

    const deviation = Math.max(0, userPathDist - shortestPathDist)
    let pathScoreVal = 10
    let accuracy: "excellent" | "good" | "average" | "poor" = "poor"

    if (deviation === 0 || deviation <= shortestPathDist * 0.05) {
      pathScoreVal = 50
      accuracy = "excellent"
    } else if (deviation <= shortestPathDist * 0.2) {
      pathScoreVal = 40
      accuracy = "good"
    } else if (deviation <= shortestPathDist * 0.45) {
      pathScoreVal = 25
      accuracy = "average"
    } else {
      pathScoreVal = 10
      accuracy = "poor"
    }

    const totalAttemptScore = exitScore + pathScoreVal
    setResultScore(totalAttemptScore)

    // Set user feedback message
    const sec = (duration / 1000).toFixed(1)
    if (totalAttemptScore >= 90) {
      setResultTitle("🏆 Outstanding Escape!")
      setResultMsg(`Perfect exit selection and ideal corridor tracing. Cleared in ${sec}s with ${Math.round(deviation)}px deviation.`)
    } else if (totalAttemptScore >= 75) {
      setResultTitle("✅ Successful Evacuation")
      setResultMsg(`Safe exit. Traced path with minor corridor deviations. Cleared in ${sec}s.`)
    } else if (totalAttemptScore >= 50) {
      setResultTitle("⚠️ Suboptimal Evacuation")
      setResultMsg(`Evacuated safely, but a closer exit was available or path tracing deviated significantly.`)
    } else {
      setResultTitle("❌ Dangerous Evacuation")
      setResultMsg(`Evacuation route was highly inefficient. Training review is advised.`)
    }

    setPhase("evaluated")

    addAttempt({
      hazard: hazardNode,
      nearestExit: isNearest ? "Nearest Gate" : "Further Gate",
      selectedExit,
      points: totalAttemptScore,
      pathDrawn: finalPath,
      pathScore: {
        score: totalAttemptScore,
        deviation,
        time: duration,
        accuracy
      }
    })
  }

  const handleUndo = () => {
    if (drawnPath.length > 1) {
      setDrawnPath(drawnPath.slice(0, -1))
    }
  }

  const handleClear = () => {
    setDrawnPath([])
  }

  const handleNextRound = () => {
    if (testData.attempts.length >= testData.totalAttempts) {
      navigate("/result")
    } else {
      pickNewHazard()
    }
  }

  // Telemetry Calculations for real-time overlay
  let userPathDist = 0
  for (let i = 0; i < drawnPath.length - 1; i++) {
    userPathDist += ptDist(drawnPath[i], drawnPath[i+1])
  }
  const { dist: shortestPathDist } = selectedExit 
    ? dijkstra(N, DEFAULT_GRAPH.adj, selectedExit, "ASSEMBLY") 
    : { dist: 0 }
  const currentDeviation = Math.max(0, userPathDist - shortestPathDist)

  return (
    <LayoutShell showHeader={phase !== "edit"}>
      <div className="space-y-4 pb-12 select-none">
        
        {/* Modern Phase HUD / Status Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Step-by-Step Sequence Indicators */}
            <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
                phase === 'hazard-confirm' 
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                  : phase !== 'edit'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {phase !== 'edit' ? "✓" : "1"}
              </div>
              <div className="w-4 h-0.5 bg-slate-200" />
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
                phase === 'exit-select' 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-pulse' 
                  : phase === 'path-draw' || phase === 'evaluated'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {phase === 'path-draw' || phase === 'evaluated' ? "✓" : "2"}
              </div>
              <div className="w-4 h-0.5 bg-slate-200" />
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
                phase === 'path-draw' 
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 animate-pulse' 
                  : phase === 'evaluated'
                    ? 'bg-sky-500/10 text-sky-500'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {phase === 'evaluated' ? "✓" : "3"}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                {phase === "hazard-confirm" && t("step1Title")}
                {phase === "exit-select" && t("step2Title")}
                {phase === "path-draw" && t("step3Title")}
                {phase === "evaluated" && t("evaluatedTitle")}
                {phase === "edit" && "Map Editor Node Placement Mode"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {phase === "hazard-confirm" && t("step1Desc")}
                {phase === "exit-select" && t("step2Desc")}
                {phase === "path-draw" && t("step3Desc")}
                {phase === "evaluated" && t("evaluatedDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
            {phase === "path-draw" && (
              <div className="flex items-center gap-2 bg-slate-900 text-slate-200 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold shadow-inner">
                <Timer className="h-4 w-4 text-sky-400 animate-spin-slow" />
                <span>{(elapsedTime / 1000).toFixed(1)}s</span>
              </div>
            )}
            
            {/* Visual Attempts Segmented Gauge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("attempts")}</span>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((idx) => {
                  const att = testData.attempts[idx]
                  return (
                    <div 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        att 
                          ? att.points >= 90 
                            ? "bg-emerald-500 border-emerald-600 shadow-xs shadow-emerald-500/25" 
                            : att.points >= 60 
                              ? "bg-amber-500 border-amber-600 shadow-xs" 
                              : "bg-red-500 border-red-600 shadow-xs"
                          : idx === testData.attempts.length
                            ? "bg-indigo-50 border-indigo-300 animate-pulse" 
                            : "bg-slate-150 border-slate-200"
                      }`}
                      title={att ? `Attempt ${idx+1}: ${att.points} pts` : `Attempt ${idx+1}`}
                    />
                  )
                })}
              </div>
            </div>

            {import.meta.env.DEV && (
              <button
                onClick={() => setPhase(phase === "edit" ? "hazard-confirm" : "edit")}
                className="rounded-xl border border-slate-300 hover:bg-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
              >
                {phase === "edit" ? t("exitEdit") : t("editMap")}
              </button>
            )}
          </div>
        </div>

        {/* Action Controls for Drawing */}
        {phase === "path-draw" && (
          <div className="flex justify-end gap-3 animate-in slide-in-from-top-3 duration-300">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={drawnPath.length <= 1}
              className="border-slate-200 hover:bg-slate-50 hover:text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
            >
              <Undo2 className="h-3.5 w-3.5" /> {t("undoLast")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="border-slate-200 hover:bg-slate-50 hover:text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("clearTracing")}
            </Button>
          </div>
        )}

        {/* Map Container */}
        <div className="relative">
          <PlantMap
            phase={phase}
            hazardNode={hazardNode}
            selectedExit={selectedExit}
            drawnPath={drawnPath}
            setDrawnPath={setDrawnPath}
            onHazardConfirmed={handleHazardConfirmed}
            onExitSelected={handleExitSelected}
            onPathComplete={handlePathComplete}
          />

          {/* Real-time Route Telemetry HUD Overlay */}
          {phase === "path-draw" && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white rounded-xl border border-slate-700/50 p-4 shadow-xl backdrop-blur-md w-48 text-xs font-mono space-y-2.5 animate-in slide-in-from-left-4 duration-300">
              <p className="font-extrabold text-sky-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider text-[9px]">
                Telemetry Overlay
              </p>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between gap-2">
                  <span>Drawn Path:</span>
                  <span className="font-bold text-slate-100">{Math.round(userPathDist)}px</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Deviation:</span>
                  <span className={`font-bold ${currentDeviation > shortestPathDist * 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.round(currentDeviation)}px
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {phase === "evaluated" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-955/40 rounded-xl backdrop-blur-xs animate-in fade-in duration-300 p-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500">
                <div className="text-5xl mb-3">{resultScore >= 90 ? "🏆" : resultScore >= 60 ? "✅" : "❌"}</div>
                <h3 className="mb-2 text-2xl font-black text-slate-800">{resultTitle}</h3>
                <p className="mb-4 text-xs font-semibold text-indigo-600">Evacuation Grade: {resultScore} / 100</p>
                <p className="mb-6 text-xs text-slate-500 leading-relaxed font-medium">{resultMsg}</p>
                <button
                  onClick={handleNextRound}
                  className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 w-full transition-all cursor-pointer"
                >
                  {testData.attempts.length >= testData.totalAttempts
                    ? t("viewFinalScore")
                    : t("continueButton")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  )
}
