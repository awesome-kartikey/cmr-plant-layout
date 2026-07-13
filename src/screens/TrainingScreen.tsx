import { useState, useEffect, useRef } from "react"
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

function DrawTimer({ drawStartTime, phase, hasStartedDrawing }: { drawStartTime: number, phase: string, hasStartedDrawing: boolean }) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    let timer: any
    if (phase === "path-draw" && hasStartedDrawing) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - drawStartTime)
      }, 100)
    } else {
      setElapsedTime(0)
    }
    return () => clearInterval(timer)
  }, [phase, hasStartedDrawing, drawStartTime])

  const elapsedSec = (elapsedTime / 1000).toFixed(1)
  const speedColor = elapsedTime < 6000 ? "text-emerald-400" : elapsedTime < 12000 ? "text-amber-400" : "text-red-400"

  return (
    <div className={`flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-inner border border-slate-700`}>
      <Timer className={`h-3.5 w-3.5 animate-pulse ${speedColor}`} />
      <span className={speedColor}>{elapsedSec}s</span>
    </div>
  )
}

export default function TrainingScreen() {
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
  const [practiceAttemptCount, setPracticeAttemptCount] = useState(0)
  const [examCountdown, setExamCountdown] = useState<number | null>(null)

  const startExamTransition = () => {
    setExamCountdown(3)
  }

  useEffect(() => {
    if (examCountdown === null) return
    if (examCountdown > 0) {
      const timer = setTimeout(() => setExamCountdown(examCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      resetTest()
      setGameMode("exam")
      pickNewHazard("exam")
      setExamCountdown(null)
    }
  }, [examCountdown])
  
  // Scoring / Details
  const [resultTitle, setResultTitle] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultScore, setResultScore] = useState(0)
  const [resultBreakdown, setResultBreakdown] = useState<{ exit: number; path: number; speed: number } | null>(null)
  const [drawStartTime, setDrawStartTime] = useState<number>(0)

  // Tutorial animation loop state
  const [showAssemblyReached, setShowAssemblyReached] = useState(false)
  const [showTutorialPath, setShowTutorialPath] = useState(true)
  const [tutorialKey, setTutorialKey] = useState(0)
  const tutorialLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    pickNewHazard("practice")
  }, [])

  // Tutorial animation loop: after path animates to assembly, show toast for 2.5s, hide, repeat
  useEffect(() => {
    if (phase !== "tutorial" || tutorialPath.length === 0) {
      setShowAssemblyReached(false)
      setShowTutorialPath(true)
      if (tutorialLoopRef.current) clearTimeout(tutorialLoopRef.current)
      return
    }
    let tutDist = 0
    for (let i = 0; i < tutorialPath.length - 1; i++) {
      tutDist += ptDist(tutorialPath[i], tutorialPath[i + 1])
    }
    const animMs = Math.max(2000, (tutDist / 400) * 1000)
    const toastMs = 2800
    const hideMs = 800

    const runLoop = () => {
      // 1. Path animates, toast & pulse hidden
      setShowTutorialPath(true)
      setShowAssemblyReached(false)
      setTutorialKey(k => k + 1)

      // 2. Once path reaches the end, hold path, show toast + pulse
      tutorialLoopRef.current = setTimeout(() => {
        setShowAssemblyReached(true)

        // 3. Keep showing everything, then hide all at once
        tutorialLoopRef.current = setTimeout(() => {
          setShowTutorialPath(false)
          setShowAssemblyReached(false)

          // 4. Stay hidden for hideMs, then restart loop
          tutorialLoopRef.current = setTimeout(() => {
            runLoop()
          }, hideMs)

        }, toastMs)
      }, animMs)
    }

    runLoop()
    return () => { if (tutorialLoopRef.current) clearTimeout(tutorialLoopRef.current) }
  }, [phase, tutorialPath])

  useEffect(() => {
    if (phase === "path-draw" && drawnPath.length > 0 && !hasStartedDrawing) {
      setHasStartedDrawing(true)
      setDrawStartTime(Date.now())
    }
    if (phase !== "path-draw") {
      setHasStartedDrawing(false)
    }
  }, [drawnPath, phase, hasStartedDrawing])

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

    if (!isNearest) {
      pathScoreVal = 0;
      speedScore = 0;
      accuracy = "poor";
    }

    const totalAttemptScore = exitScore + pathScoreVal + speedScore
    setResultScore(totalAttemptScore)
    setResultBreakdown({ exit: exitScore, path: pathScoreVal, speed: speedScore })

    const sec = (duration / 1000).toFixed(1)
    if (!isNearest) {
      setResultTitle("Fatal Error!")
      setResultMsg("You selected the wrong emergency exit! This is highly dangerous.")
    } else if (totalAttemptScore >= 90) {
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
    setShowAssemblyReached(true)
    setTimeout(() => {
      setShowAssemblyReached(false)
    }, 2500)

    if (gameMode === "exam") {
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
    } else {
      setPracticeAttemptCount(prev => prev + 1)
    }
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
  const isLastAttempt = testData.attempts.length >= testData.totalAttempts

  const isExam = gameMode === "exam";
  const hudBg = isExam ? "bg-rose-50/80 border-rose-100" : "bg-sky-50/80 border-sky-100";
  const hudTitleColor = isExam ? "text-rose-900" : "text-sky-900";
  const hudDescColor = isExam ? "text-rose-700/80" : "text-sky-700/80";

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
            
            {/* Title + subtitle */}
            <div className={`${hudBg} border rounded-xl px-5 py-3 shadow-sm`}>
              <h3 className={`font-black ${hudTitleColor} text-lg tracking-tight flex items-center gap-2`}>
                {isWizard && <span className="text-white bg-indigo-600 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider mr-1 shadow-sm">WIZARD {wizardIndex + 1}/{ROOMS.length}</span>}
                {gameMode === "exam" && phase !== "evaluated" && phase !== "idle" && (
                  <span className="text-white bg-rose-600 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider mr-1 shadow-sm">EXAM</span>
                )}
                {gameMode === "practice" && phase !== "evaluated" && phase !== "idle" && (
                  <span className="text-white bg-sky-600 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider mr-1 shadow-sm">PRACTICE</span>
                )}
                {phase === "idle" && <span className="text-slate-600">Select a mode to begin</span>}
                {phase === "tutorial" && `Tutorial: ${roomName}`}
                {phase === "hazard-confirm" && t("step1Title")}
                {phase === "exit-select" && (isWizard ? `Select Rank ${wizardExitRank} Nearest Exit` : t("step2Title"))}
                {phase === "path-draw" && t("step3Title")}
                {phase === "evaluated" && t("evaluatedTitle")}
                {phase === "edit" && "Map Editor"}
              </h3>
              <p className={`text-sm ${hudDescColor} font-bold mt-1`}>
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

            {/* Idle: Start buttons (DEV-only) */}
            {phase === "idle" && import.meta.env.DEV && (
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
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={startExamTransition}
                  className="h-12 px-6 border-2 border-slate-300 hover:bg-slate-100 hover:text-slate-800 font-black rounded-xl text-base flex items-center gap-2 shadow-sm text-slate-600 transition-all hover:scale-105"
                >
                  Skip Training
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setPhase("hazard-confirm")}
                  className="h-12 px-8 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-base flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-105 hover:-translate-y-0.5"
                >
                  I understand <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Path Draw: Timer + controls */}
            {phase === "path-draw" && (
              <>
                <DrawTimer drawStartTime={drawStartTime} phase={phase} hasStartedDrawing={hasStartedDrawing} />
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
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {gameMode === "exam" ? t("attempts") : "Practice Attempt"}
                </span>
                <span className="text-sm font-black text-slate-700 font-mono leading-none flex items-baseline tracking-tighter">
                  {gameMode === "exam" ? attemptNum : practiceAttemptCount + 1}
                  {gameMode === "exam" && (
                    <>
                      <span className="text-xs text-slate-400 font-bold mx-0.5">/</span>
                      <span className="text-[11px] text-slate-400">{testData.totalAttempts}</span>
                    </>
                  )}
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
            showAssemblyReached={showAssemblyReached}
            showTutorialPath={showTutorialPath}
            tutorialKey={tutorialKey}
          />

          {/* ── Assembly Reached Toast Overlay ── */}
          {(phase === "tutorial" || phase === "evaluated") && showAssemblyReached && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div
                className="flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl border pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
                  border: '1.5px solid rgba(134,239,172,0.5)',
                  boxShadow: '0 0 0 4px rgba(34,197,94,0.15), 0 20px 60px rgba(22,101,52,0.55)',
                  animation: 'slide-up-fade 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
                  maxWidth: '90%',
                }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-green-400/20 border-2 border-green-400/50 flex items-center justify-center text-3xl">
                  ✅
                </div>
                <div>
                  <div className="text-white font-black text-xl tracking-tight leading-snug">You have reached the</div>
                  <div className="text-green-300 font-black text-2xl tracking-tight leading-snug">Emergency Assembly Area!</div>
                  <div className="text-green-200/80 text-sm mt-1 font-medium">This is the safe muster point during an evacuation.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Idle overlay: Mode selection prompt (DEV-only) ── */}
          {phase === "idle" && import.meta.env.DEV && (
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
          {phase === "evaluated" && !showAssemblyReached && (
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
                  
                  {gameMode === "exam" ? (
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
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={startExamTransition}
                        className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-8 py-3.5 text-sm font-bold text-white w-full transition-all hover:opacity-90 hover:scale-[1.02] shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        Start Exam Now <ClipboardCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextRound}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3.5 text-sm font-bold w-full transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        Try Another Practice <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* ── Exam Countdown Overlay ── */}
          {examCountdown !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
              <div className="text-center animate-in zoom-in duration-300">
                <h2 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
                  Transitioning to Exam Mode
                </h2>
                <div className="text-9xl font-black text-rose-500 mb-8 animate-pulse drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                  {examCountdown > 0 ? examCountdown : "GO!"}
                </div>
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 max-w-md mx-auto">
                  <p className="text-white/90 text-lg font-medium flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                    No hints will be shown. Attempts will be fully scored. Good luck!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  )
}
