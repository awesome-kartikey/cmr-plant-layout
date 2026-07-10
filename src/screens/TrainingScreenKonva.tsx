import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { PlantMapKonva } from "../components/plant-map/PlantMapKonva"
import type { Point } from "../lib/graph"
import { N, ROOMS, IDEAL_ROUTES, dijkstra, ptDist, DEFAULT_GRAPH, getNearestExits, PATH_BLOCKS, EXIT_ZONES, findShortestGridPath } from "../lib/graph"
import { Flame, DoorOpen, Route, Timer, Undo2, RotateCcw, Zap, ChevronRight, BookOpen, ClipboardCheck, Trophy, AlertTriangle, CheckCircle2, XCircle, Crosshair } from "lucide-react"
import { Button } from "../components/ui/button"

type Phase = "idle" | "tutorial" | "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"

// --- Phase Config for dynamic banner ---
const PHASE_CONFIG = {
  idle: { step: 0, color: "slate", icon: null, label: "" },
  tutorial: { step: 1, color: "sky", icon: BookOpen, label: "Tutorial" },
  "hazard-confirm": { step: 1, color: "red", icon: Flame, label: "Step 1: Identify Hazard" },
  "exit-select": { step: 2, color: "emerald", icon: DoorOpen, label: "Step 2: Choose Exit Gate" },
  "path-draw": { step: 3, color: "sky", icon: Route, label: "Step 3: Trace Evacuation Path" },
  evaluated: { step: 3, color: "indigo", icon: ClipboardCheck, label: "Assessment Evaluated" },
  edit: { step: 0, color: "orange", icon: Crosshair, label: "Map Editor" },
}

export default function TrainingScreenKonva() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addAttempt, testData, resetTest } = useTest()

  const [phase, setPhase] = useState<Phase>("idle")
  const [gameMode, setGameMode] = useState<"idle" | "practice" | "exam">("idle")
  const [hazardNode, setHazardNode] = useState<string>("")
  const [selectedExit, setSelectedExit] = useState<string>("")
  const [drawnPath, setDrawnPath] = useState<Point[]>([])
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false)
  const [tutorialPath, setTutorialPath] = useState<Point[]>([])
  
  // Scoring / Details
  const [resultTitle, setResultTitle] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultScore, setResultScore] = useState(0)
  const [resultBreakdown, setResultBreakdown] = useState<{ exit: number; path: number; speed: number } | null>(null)
  const [drawStartTime, setDrawStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Wizard State
  const [isWizard, setIsWizard] = useState(false)
  const [wizardIndex, setWizardIndex] = useState(0)
  const [wizardExitRank, setWizardExitRank] = useState(1)
  const [wizardRoutes, setWizardRoutes] = useState<Record<string, { exit: string, blocks: Point[] }[]>>({})

  const startWizard = () => {
    setIsWizard(true)

    let startIndex = 0;
    for (let i = 0; i < ROOMS.length; i++) {
      if (!IDEAL_ROUTES[ROOMS[i].nodeId]) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex >= ROOMS.length) {
      alert("All routes are already mapped in IDEAL_ROUTES!")
      setIsWizard(false)
      return
    }

    setWizardIndex(startIndex)
    setWizardExitRank(1)
    setWizardRoutes({})
    loadWizardHazard(startIndex)
  }

  const loadWizardHazard = (index: number) => {
    if (index >= ROOMS.length) {
      alert("Wizard Complete! All rooms have been mapped. Please click 'Export Wizard' to save your progress.")
      setPhase("tutorial")
      return
    }
    const room = ROOMS[index]
    setHazardNode(room.nodeId)
    setSelectedExit("")
    setDrawnPath([])
    setPhase("exit-select")
  }
  
  useEffect(() => {
    resetTest()
  }, [])

  useEffect(() => {
    if (phase === "path-draw" && drawnPath.length > 0 && !hasStartedDrawing) {
      setHasStartedDrawing(true)
      setDrawStartTime(Date.now())
    }
    if (phase !== "path-draw") {
      setHasStartedDrawing(false)
      if (phase === "exit-select") setElapsedTime(0)
    }
  }, [drawnPath, phase, hasStartedDrawing])

  useEffect(() => {
    let timer: any
    if (phase === "path-draw" && hasStartedDrawing) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - drawStartTime)
      }, 100)
    }
    return () => clearInterval(timer)
  }, [phase, hasStartedDrawing, drawStartTime])

  const pickNewHazard = (mode: "practice" | "exam") => {
    const room = ROOMS[Math.floor(Math.random() * ROOMS.length)]
    setHazardNode(room.nodeId)
    setSelectedExit("")
    setDrawnPath([])
    setGameMode(mode)
    
    // Tutorial Setup
    const routes = IDEAL_ROUTES[room.nodeId]
    if (routes && routes.length > 0) {
      const idealRoute = routes[0]
      setTutorialPath(idealRoute.blocks)
      setSelectedExit(idealRoute.exit)
    } else {
      const { dists, minD } = getNearestExits(N, DEFAULT_GRAPH.adj, room.nodeId)
      const nearestExitKey = Object.keys(dists).find(ex => dists[ex].dist === minD && ex !== "ASSEMBLY")
      if (nearestExitKey) {
        const exitPathStr = dists[nearestExitKey].path
        const assemblyPathStr = dijkstra(N, DEFAULT_GRAPH.adj, nearestExitKey, "ASSEMBLY").path
        const fullPathStr = [...exitPathStr, ...assemblyPathStr.slice(1)]
        setTutorialPath(fullPathStr.map(k => N[k]))
        setSelectedExit(nearestExitKey)
      }
    }

    if (mode === "exam") {
      setPhase("exit-select")
    } else {
      setPhase("tutorial")
    }
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
    if (isWizard) {
      setWizardRoutes(prev => {
        const currentRoutes = prev[hazardNode] || []
        return {
          ...prev,
          [hazardNode]: [...currentRoutes, { exit: selectedExit, blocks: finalPath }]
        }
      })

      if (wizardExitRank < 3) {
        setWizardExitRank(wizardExitRank + 1)
        setPhase("exit-select")
        setSelectedExit("")
      } else {
        let nextIndex = wizardIndex + 1
        while (nextIndex < ROOMS.length && IDEAL_ROUTES[ROOMS[nextIndex].nodeId]) {
          nextIndex++
        }
        
        setWizardIndex(nextIndex)
        setWizardExitRank(1)
        loadWizardHazard(nextIndex)
      }
      return
    }

    const duration = Date.now() - drawStartTime
    
    // 1. Grade Exit Selection (Max 20 pts)
    const hazardPt = N[hazardNode]
    const blockSize = 25
    let optimalBlockCount = 0;
    
    const idealRoutesForHazard = IDEAL_ROUTES[hazardNode] || [];
    
    let targetGateForRank1 = "";
    if (idealRoutesForHazard.length > 0) {
      const rank1ZoneId = idealRoutesForHazard[0].exit;
      const rank1Zone = EXIT_ZONES.find(z => z.id === rank1ZoneId);
      if (rank1Zone) targetGateForRank1 = (rank1Zone as any).targetNode;
    }
    
    const isNearest = (selectedExit === targetGateForRank1);
    const exitScore = isNearest ? 20 : 5;

    // 2. Grade Path Traced (Max 40 pts)
    if (idealRoutesForHazard.length > 0) {
      const idealRoute = idealRoutesForHazard.find(r => {
        const zone = EXIT_ZONES.find(z => z.id === r.exit);
        return zone && (zone as any).targetNode === selectedExit;
      });
      
      if (idealRoute) {
        let idealPathDist = 0;
        for (let i = 0; i < idealRoute.blocks.length - 1; i++) {
          idealPathDist += ptDist(idealRoute.blocks[i], idealRoute.blocks[i+1]);
        }
        optimalBlockCount = idealPathDist / blockSize;
      }
    }

    if (optimalBlockCount === 0) {
      const exitBlocks = PATH_BLOCKS.filter(b => 
        EXIT_ZONES.some(z => b.x >= z.x && b.x <= z.x + z.width && b.y >= z.y && b.y <= z.y + z.height)
      );
      const hazardStartBlock = PATH_BLOCKS.reduce((closest, b) => {
          const d = Math.sqrt((b.x - hazardPt.x) ** 2 + (b.y - hazardPt.y) ** 2);
          return d < closest.d ? { b, d } : closest;
      }, { b: PATH_BLOCKS[0], d: Infinity }).b;

      const shortestBlocks = findShortestGridPath(PATH_BLOCKS, hazardStartBlock, exitBlocks, blockSize) || [];
      optimalBlockCount = shortestBlocks.length;
      if (shortestBlocks.length > 0) {
         const lastExitBlock = shortestBlocks[shortestBlocks.length - 1];
         const assemblyNode = N["ASSEMBLY"];
         const distToAssembly = ptDist(lastExitBlock, assemblyNode);
         optimalBlockCount += distToAssembly / blockSize;
      }
    }
    
    let userPathDist = 0
    for (let i = 0; i < finalPath.length - 1; i++) {
      userPathDist += ptDist(finalPath[i], finalPath[i+1])
    }
    
    const userBlockCount = userPathDist / blockSize;
    const deviation = Math.max(0, Math.abs(userBlockCount - optimalBlockCount))
    let pathScoreVal = 5
    let accuracy: "excellent" | "good" | "average" | "poor" = "poor"

    // Path Leniency Percentages
    if (deviation <= optimalBlockCount * 0.05) {
      pathScoreVal = 40 // 5% leniency
      accuracy = "excellent"
    } else if (deviation <= optimalBlockCount * 0.15) {
      pathScoreVal = 30 // 15% leniency
      accuracy = "good"
    } else if (deviation <= optimalBlockCount * 0.30) {
      pathScoreVal = 15 // 30% leniency
      accuracy = "average"
    } else {
      pathScoreVal = 5
      accuracy = "poor"
    }

    // 3. Grade Speed (Max 40 pts)
    // Time Leniency Percentages (Expected 120ms per block drawn, minimum 3.5 seconds)
    const expectedTimeMs = Math.max(3500, optimalBlockCount * 120); 
    const timeDeviation = Math.max(0, duration - expectedTimeMs);
    let speedScore = 0;
    
    if (timeDeviation <= expectedTimeMs * 0.10) {
      speedScore = 40; // 10% extra time leniency
    } else if (timeDeviation <= expectedTimeMs * 0.25) {
      speedScore = 25; // 25% extra time leniency
    } else if (timeDeviation <= expectedTimeMs * 0.50) {
      speedScore = 10; // 50% extra time leniency
    } else {
      speedScore = 0;
    }

    const totalAttemptScore = exitScore + pathScoreVal + speedScore
    setResultScore(totalAttemptScore)
    setResultBreakdown({ exit: exitScore, path: pathScoreVal, speed: speedScore })

    const sec = (duration / 1000).toFixed(1)
    if (totalAttemptScore >= 90) {
      setResultTitle("Outstanding Escape!")
      setResultMsg(`Perfect execution! Cleared in ${sec}s.`)
    } else if (totalAttemptScore >= 70) {
      setResultTitle("Good Attempt")
      setResultMsg(`Good pathing, but could be faster. Cleared in ${sec}s.`)
    } else if (totalAttemptScore >= 40) {
      setResultTitle("Needs Improvement")
      setResultMsg(`Average route. Try drawing the path faster next time. Cleared in ${sec}s.`)
    } else {
      setResultTitle("Poor Route")
      setResultMsg(`Too slow or took the long way around. Cleared in ${sec}s.`)
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
      pickNewHazard(gameMode as "practice" | "exam")
    }
  }

  // Telemetry Calculations
  let userPathDist = 0
  for (let i = 0; i < drawnPath.length - 1; i++) {
    userPathDist += ptDist(drawnPath[i], drawnPath[i+1])
  }
  
  const blockSize = 25
  const exitBlocks = PATH_BLOCKS.filter(b => 
    EXIT_ZONES.some(z => b.x >= z.x && b.x <= z.x + z.width && b.y >= z.y && b.y <= z.y + z.height)
  );
  const hazardStartBlock = PATH_BLOCKS.reduce((closest, b) => {
      const hazardPt = N[hazardNode] || { x: 0, y: 0 };
      const d = Math.sqrt((b.x - hazardPt.x) ** 2 + (b.y - hazardPt.y) ** 2);
      return d < closest.d ? { b, d } : closest;
  }, { b: PATH_BLOCKS[0], d: Infinity }).b;

  const shortestBlocks = (selectedExit && PATH_BLOCKS.length > 0 ? findShortestGridPath(PATH_BLOCKS, hazardStartBlock, exitBlocks, blockSize) : []) || [];
  const optimalBlockCount = shortestBlocks.length;
  const userBlockCount = userPathDist / blockSize;
  const currentDeviation = selectedExit && PATH_BLOCKS.length > 0 ? Math.max(0, Math.abs(userBlockCount - optimalBlockCount)) : 0;

  const exportWizardData = () => {
    let str = "export const IDEAL_ROUTES: Record<string, { exit: string, blocks: {x: number, y: number}[] }[]> = {\n"
    
    const allKeys = Array.from(new Set([...Object.keys(IDEAL_ROUTES), ...Object.keys(wizardRoutes)]))
    
    allKeys.forEach(k => {
      const routesArray = wizardRoutes[k] || IDEAL_ROUTES[k]
      str += `  "${k}": [\n`
      routesArray.forEach(data => {
        str += `    { exit: "${data.exit}", blocks: ${JSON.stringify(data.blocks)} },\n`
      })
      str += `  ],\n`
    })
    str += "}"
    navigator.clipboard.writeText(str).then(() => alert("Wizard Routes copied to clipboard!"))
  }

  // Derived UI helpers
  const roomName = ROOMS.find(r => r.nodeId === hazardNode)?.name || "Emergency"
  const attemptNum = Math.min(testData.attempts.length + 1, testData.totalAttempts)
  const elapsedSec = (elapsedTime / 1000).toFixed(1)
  const speedColor = elapsedTime < 10000 ? "text-emerald-400" : elapsedTime < 15000 ? "text-amber-400" : "text-red-400"
  const isLastAttempt = testData.attempts.length >= testData.totalAttempts

  const scoreColor = resultScore >= 90 ? "text-emerald-500" : resultScore >= 70 ? "text-indigo-500" : resultScore >= 40 ? "text-amber-500" : "text-red-500"
  const scoreGradient = resultScore >= 90
    ? "from-emerald-500 to-teal-600"
    : resultScore >= 70
    ? "from-indigo-500 to-sky-600"
    : resultScore >= 40
    ? "from-amber-500 to-orange-600"
    : "from-red-500 to-rose-600"
  const ScoreIcon = resultScore >= 70 ? CheckCircle2 : resultScore >= 40 ? AlertTriangle : XCircle

  return (
    <LayoutShell showHeader={phase !== "edit"}>
      <div className="flex flex-col gap-3 pb-12 select-none">
        
        {/* ── Phase HUD Banner ── */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl py-2.5 px-4 shadow-sm">
          
          {/* Left: Step indicators + title */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Step Pills */}
            {phase !== "idle" && phase !== "edit" && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                {[
                  { n: 1, active: phase === "hazard-confirm" || phase === "tutorial", done: phase === "exit-select" || phase === "path-draw" || phase === "evaluated", color: "red" },
                  { n: 2, active: phase === "exit-select", done: phase === "path-draw" || phase === "evaluated", color: "emerald" },
                  { n: 3, active: phase === "path-draw", done: phase === "evaluated", color: "sky" },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center gap-1.5">
                    {i > 0 && <div className={`w-5 h-px ${s.done || s.active ? "bg-slate-300" : "bg-slate-200"}`} />}
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300 ${
                      s.done
                        ? s.color === "red" ? "bg-red-100 text-red-500" : s.color === "emerald" ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                        : s.active
                        ? s.color === "red" ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse" : s.color === "emerald" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 animate-pulse" : "bg-sky-500 text-white shadow-md shadow-sky-500/30 animate-pulse"
                        : "bg-slate-200 text-slate-400"
                    }`}>
                      {s.done ? "✓" : s.n}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            {/* Title + subtitle */}
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                {isWizard && <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mr-1">WIZARD {wizardIndex + 1}/{ROOMS.length}</span>}
                {gameMode === "exam" && phase !== "evaluated" && phase !== "idle" && (
                  <span className="text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mr-1">EXAM</span>
                )}
                {phase === "idle" && <span className="text-slate-500">Select a mode to begin</span>}
                {phase === "tutorial" && `Tutorial: ${roomName}`}
                {phase === "hazard-confirm" && t("step1Title")}
                {phase === "exit-select" && (isWizard ? `Select Rank ${wizardExitRank} Nearest Exit` : t("step2Title"))}
                {phase === "path-draw" && t("step3Title")}
                {phase === "evaluated" && t("evaluatedTitle")}
                {phase === "edit" && "Map Editor"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {phase === "idle" && "Practice to prepare, or take the Exam to be scored."}
                {phase === "tutorial" && "Observe the ideal evacuation route, then proceed."}
                {phase === "hazard-confirm" && t("step1Desc")}
                {phase === "exit-select" && (isWizard ? `Click on the gate that is the ${wizardExitRank} nearest to the hazard.` : t("step2Desc"))}
                {phase === "path-draw" && t("step3Desc")}
                {phase === "evaluated" && t("evaluatedDesc")}
              </p>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap">

            {/* Idle: Start buttons */}
            {phase === "idle" && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => { setGameMode("practice"); pickNewHazard("practice"); }}
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Practice
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => { setGameMode("exam"); pickNewHazard("exam"); }}
                  className="h-9 px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-rose-600/25 transition-all hover:scale-105"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" /> Exam Mode
                </Button>
              </>
            )}

            {/* Tutorial: Proceed button */}
            {phase === "tutorial" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setPhase("hazard-confirm")}
                className="h-9 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all hover:scale-105"
              >
                I understand <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Path Draw: Timer + controls */}
            {phase === "path-draw" && (
              <>
                <div className={`flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-inner border border-slate-700`}>
                  <Timer className={`h-3.5 w-3.5 animate-pulse ${speedColor}`} />
                  <span className={speedColor}>{elapsedSec}s</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={drawnPath.length <= 1}
                  className="h-8 px-2.5 border-slate-200 hover:bg-slate-50 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white disabled:opacity-40"
                >
                  <Undo2 className="h-3.5 w-3.5" /> <span className="hidden md:inline">{t("undoLast")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 px-2.5 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden md:inline">{t("clearTracing")}</span>
                </Button>
                {isWizard && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePathComplete(drawnPath)}
                    disabled={drawnPath.length === 0}
                    className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center shadow-md shadow-indigo-600/20"
                  >
                    Save Route & Next
                  </Button>
                )}
              </>
            )}
            
            {/* Attempt counter */}
            {phase !== "idle" && phase !== "edit" && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("attempts")}</span>
                <span className="text-sm font-black text-slate-700 font-mono leading-none flex items-baseline tracking-tighter">
                  {attemptNum}
                  <span className="text-xs text-slate-400 font-bold mx-0.5">/</span>
                  <span className="text-[11px] text-slate-400">{testData.totalAttempts}</span>
                </span>
              </div>
            )}

            {/* DEV-only: Wizard & Edit buttons */}
            {import.meta.env.DEV && (
              <>
                {!isWizard ? (
                  <button
                    onClick={startWizard}
                    className="rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 cursor-pointer transition-colors"
                  >
                    Start Wizard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        let nextIndex = wizardIndex + 1
                        while (nextIndex < ROOMS.length && IDEAL_ROUTES[ROOMS[nextIndex].nodeId]) {
                          nextIndex++
                        }
                        setWizardIndex(nextIndex)
                        setWizardExitRank(1)
                        loadWizardHazard(nextIndex)
                      }}
                      className="rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 cursor-pointer transition-colors"
                    >
                      Skip to Next Room
                    </button>
                    <button
                      onClick={exportWizardData}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 cursor-pointer transition-colors"
                    >
                      Export Wizard
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPhase(phase === "edit" ? "hazard-confirm" : "edit")}
                  className="rounded-xl border border-slate-300 hover:bg-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
                >
                  {phase === "edit" ? t("exitEdit") : t("editMap")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Map Container ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200">
          <PlantMapKonva
            phase={phase}
            hazardNode={hazardNode}
            selectedExit={selectedExit}
            drawnPath={drawnPath}
            setDrawnPath={setDrawnPath}
            tutorialPath={tutorialPath}
            onHazardConfirmed={handleHazardConfirmed}
            onExitSelected={handleExitSelected}
            onPathComplete={handlePathComplete}
            isWizard={isWizard}
            wizardDrawnPaths={wizardRoutes[hazardNode] ? wizardRoutes[hazardNode].map(r => r.blocks) : []}
            wizardSelectedExits={wizardRoutes[hazardNode] ? wizardRoutes[hazardNode].map(r => r.exit) : []}
          />

          {/* ── Idle overlay: Mode selection prompt ── */}
          {phase === "idle" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-400">
                <div className="text-5xl mb-4">🏭</div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Fire Evacuation Training</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Test your knowledge of emergency exits and evacuation procedures across the plant layout.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setGameMode("practice"); pickNewHazard("practice"); }}
                    className="flex-1 flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl px-6 py-5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Practice Mode</span>
                    <span className="text-[10px] text-indigo-200 font-normal">Tutorial hints shown</span>
                  </button>
                  <button
                    onClick={() => { setGameMode("exam"); pickNewHazard("exam"); }}
                    className="flex-1 flex flex-col items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl px-6 py-5 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <ClipboardCheck className="h-6 w-6" />
                    <span className="text-sm">Exam Mode</span>
                    <span className="text-[10px] text-rose-200 font-normal">No hints, fully scored</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          
          {/* ── Evaluated Result Modal ── */}
          {phase === "evaluated" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 rounded-xl backdrop-blur-sm animate-in fade-in duration-300 p-4">
              <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-400 overflow-hidden">
                {/* Score header gradient strip */}
                <div className={`bg-gradient-to-r ${scoreGradient} p-6 text-center text-white`}>
                  <ScoreIcon className="h-12 w-12 mx-auto mb-2 opacity-90" />
                  <p className="text-4xl font-black mb-0.5">{resultScore}<span className="text-lg font-bold opacity-70">/100</span></p>
                  <h3 className="text-lg font-black tracking-tight">{resultTitle}</h3>
                </div>
                
                {/* Breakdown */}
                <div className="p-5">
                  {resultBreakdown && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Exit", value: resultBreakdown.exit, max: 20, color: "emerald" },
                        { label: "Path", value: resultBreakdown.path, max: 40, color: "sky" },
                        { label: "Speed", value: resultBreakdown.speed, max: 40, color: "indigo" },
                      ].map(item => (
                        <div key={item.label} className={`rounded-xl bg-${item.color}-50 border border-${item.color}-100 p-2.5 text-center`}>
                          <p className={`text-lg font-black text-${item.color}-600`}>{item.value}</p>
                          <p className={`text-[9px] font-bold text-${item.color}-400 uppercase tracking-wide`}>{item.label}</p>
                          <p className={`text-[9px] text-${item.color}-300`}>/{item.max}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5 text-center">{resultMsg}</p>
                  
                  <button
                    onClick={handleNextRound}
                    className={`rounded-xl bg-gradient-to-r ${scoreGradient} px-8 py-3.5 text-sm font-bold text-white w-full transition-all hover:opacity-90 hover:scale-[1.02] shadow-md cursor-pointer flex items-center justify-center gap-2`}
                  >
                    {isLastAttempt ? (
                      <><Trophy className="h-4 w-4" /> {t("viewFinalScore")}</>
                    ) : (
                      <>{t("continueButton")} <ChevronRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  )
}
