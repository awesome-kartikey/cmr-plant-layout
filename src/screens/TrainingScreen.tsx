import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { PlantMap } from "../components/plant-map/PlantMap"
import type { Point } from "../lib/graph"
import { N, ROOMS, IDEAL_ROUTES, dijkstra, ptDist, DEFAULT_GRAPH, getNearestExits, PATH_BLOCKS, EXIT_ZONES, findShortestGridPath } from "../lib/graph"
import { Flame, DoorOpen, Route, Timer, Undo2, RotateCcw } from "lucide-react"
import { Button } from "../components/ui/button"

type Phase = "tutorial" | "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"

export default function TrainingScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addAttempt, testData, resetTest } = useTest()

  const [phase, setPhase] = useState<Phase>("tutorial")
  const [hazardNode, setHazardNode] = useState<string>("")
  const [selectedExit, setSelectedExit] = useState<string>("")
  const [drawnPath, setDrawnPath] = useState<Point[]>([])
  const [tutorialPath, setTutorialPath] = useState<Point[]>([])
  
  // Scoring / Details
  const [resultTitle, setResultTitle] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultScore, setResultScore] = useState(0)
  const [drawStartTime, setDrawStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Wizard State
  const [isWizard, setIsWizard] = useState(false)
  const [wizardIndex, setWizardIndex] = useState(0)
  const [wizardExitRank, setWizardExitRank] = useState(1)
  const [wizardRoutes, setWizardRoutes] = useState<Record<string, { exit: string, blocks: Point[] }[]>>({})

  const startWizard = () => {
    setIsWizard(true)

    // Find first room not in IDEAL_ROUTES
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
    
    // Tutorial Setup
    const { dists, minD } = getNearestExits(N, DEFAULT_GRAPH.adj, room.nodeId)
    const nearestExitKey = Object.keys(dists).find(ex => dists[ex].dist === minD && ex !== "ASSEMBLY")
    if (nearestExitKey) {
      const exitPathStr = dists[nearestExitKey].path
      const assemblyPathStr = dijkstra(N, DEFAULT_GRAPH.adj, nearestExitKey, "ASSEMBLY").path
      const fullPathStr = [...exitPathStr, ...assemblyPathStr.slice(1)]
      setTutorialPath(fullPathStr.map(k => N[k]))
      setSelectedExit(nearestExitKey)
    }

    setPhase("tutorial")
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
        // Find next room not in IDEAL_ROUTES
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
    const exitScore = isNearest ? 20 : 5

    // 2. Grade Path Traced (Max 40 pts)
    const blockSize = 25
    
    // Find optimal path blocks
    const exitBlocks = PATH_BLOCKS.filter(b => 
      EXIT_ZONES.some(z => b.x >= z.x && b.x <= z.x + z.width && b.y >= z.y && b.y <= z.y + z.height)
    );
    const hazardStartBlock = PATH_BLOCKS.reduce((closest, b) => {
        const d = Math.sqrt((b.x - hazardPt.x) ** 2 + (b.y - hazardPt.y) ** 2);
        return d < closest.d ? { b, d } : closest;
    }, { b: PATH_BLOCKS[0], d: Infinity }).b;

    const shortestBlocks = findShortestGridPath(PATH_BLOCKS, hazardStartBlock, exitBlocks, blockSize) || [];
    const optimalBlockCount = shortestBlocks.length;
    
    // Calculate user's length in pixels
    let userPathDist = 0
    for (let i = 0; i < finalPath.length - 1; i++) {
      userPathDist += ptDist(finalPath[i], finalPath[i+1])
    }
    
    // Estimate user's block count based on length
    const userBlockCount = userPathDist / blockSize;

    const deviation = Math.max(0, Math.abs(userBlockCount - optimalBlockCount))
    let pathScoreVal = 5
    let accuracy: "excellent" | "good" | "average" | "poor" = "poor"

    if (deviation <= optimalBlockCount * 0.05) {
      pathScoreVal = 40
      accuracy = "excellent"
    } else if (deviation <= optimalBlockCount * 0.2) {
      pathScoreVal = 30
      accuracy = "good"
    } else if (deviation <= optimalBlockCount * 0.45) {
      pathScoreVal = 15
      accuracy = "average"
    } else {
      pathScoreVal = 5
      accuracy = "poor"
    }

    // 3. Grade Speed (Max 40 pts)
    let speedScore = 0
    if (duration <= 10000) {
      speedScore = 40
    } else if (duration <= 15000) {
      speedScore = 25
    } else if (duration <= 20000) {
      speedScore = 10
    } else {
      speedScore = 0
    }

    const totalAttemptScore = exitScore + pathScoreVal + speedScore
    setResultScore(totalAttemptScore)

    // Set user feedback message
    const sec = (duration / 1000).toFixed(1)
    if (totalAttemptScore >= 90) {
      setResultTitle("🏆 Outstanding Escape!")
      setResultMsg(`Perfect execution! Cleared in ${sec}s.`)
    } else if (totalAttemptScore >= 70) {
      setResultTitle("✅ Good Attempt")
      setResultMsg(`Good pathing, but could be faster. Cleared in ${sec}s.`)
    } else if (totalAttemptScore >= 40) {
      setResultTitle("⚠️ Needs Improvement")
      setResultMsg(`Average route. Try drawing the path faster next time. Cleared in ${sec}s.`)
    } else {
      setResultTitle("❌ Poor Route")
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
      pickNewHazard()
    }
  }

  // Telemetry Calculations for real-time overlay
  let userPathDist = 0
  for (let i = 0; i < drawnPath.length - 1; i++) {
    userPathDist += ptDist(drawnPath[i], drawnPath[i+1])
  }
  
  // Calculate block logic for telemetry
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
    Object.keys(wizardRoutes).forEach(k => {
      const routesArray = wizardRoutes[k]
      str += `  "${k}": [\n`
      routesArray.forEach(data => {
        str += `    { exit: "${data.exit}", blocks: ${JSON.stringify(data.blocks)} },\n`
      })
      str += `  ],\n`
    })
    str += "}"
    navigator.clipboard.writeText(str).then(() => alert("Wizard Routes copied to clipboard!"))
  }

  return (
    <LayoutShell showHeader={phase !== "edit"}>
      <div className="space-y-2 pb-12 select-none">
        
        {/* Modern Phase HUD / Status Banner */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl py-2 px-4 shadow-sm animate-in fade-in duration-300">
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
                {isWizard && <span className="text-indigo-600 mr-2">[WIZARD {wizardIndex + 1}/{ROOMS.length}]</span>}
                {phase === "tutorial" && `Tutorial: ${ROOMS.find(r => r.nodeId === hazardNode)?.name || "Emergency"}`}
                {phase === "hazard-confirm" && t("step1Title")}
                {phase === "exit-select" && (isWizard ? `Select Rank ${wizardExitRank} Nearest Exit` : t("step2Title"))}
                {phase === "path-draw" && t("step3Title")}
                {phase === "evaluated" && t("evaluatedTitle")}
                {phase === "edit" && "Map Editor Node Placement Mode"}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {phase === "tutorial" && "Observe the shortest evacuation route."}
                {phase === "hazard-confirm" && t("step1Desc")}
                {phase === "exit-select" && (isWizard ? `Click on the gate that is the ${wizardExitRank} nearest to the hazard.` : t("step2Desc"))}
                {phase === "path-draw" && t("step3Desc")}
                {phase === "evaluated" && t("evaluatedDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-2.5 shrink-0 flex-wrap">
            {phase === "tutorial" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setPhase("hazard-confirm")}
                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center shadow-md shadow-indigo-600/20"
              >
                Start Practice 🚀
              </Button>
            )}
            {phase === "path-draw" && (
              <>
                <div className="flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-inner">
                  <Timer className="h-4 w-4 text-sky-400 animate-spin-slow" />
                  <span>{(elapsedTime / 1000).toFixed(1)}s</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={drawnPath.length <= 1}
                  className="h-8 px-2.5 border-slate-200 hover:bg-slate-50 hover:text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
                >
                  <Undo2 className="h-3.5 w-3.5" /> <span className="hidden md:inline">{t("undoLast")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 px-2.5 border-slate-200 hover:bg-slate-50 hover:text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
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
            
            {/* Visual Attempts Segmented Gauge */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("attempts")}</span>
              <span className="text-sm font-black text-slate-700 font-mono leading-none flex items-baseline tracking-tighter">
                {Math.min(testData.attempts.length + 1, testData.totalAttempts)}
                <span className="text-xs text-slate-400 font-bold mx-0.5">/</span>
                <span className="text-[11px] text-slate-400">{testData.totalAttempts}</span>
              </span>
            </div>

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

        {/* Map Container */}
        <div className="relative">
          <PlantMap
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
                  <span className={`font-bold ${currentDeviation > optimalBlockCount * 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.round(currentDeviation)} blocks
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
