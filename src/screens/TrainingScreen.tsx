import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { PlantMap } from "../components/plant-map/PlantMap"
import { N, ROOMS } from "../lib/graph"
import type { Point } from "../lib/graph"

type Phase = "playing" | "evaluated" | "edit"

export default function TrainingScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addAttempt, testData, resetTest } = useTest()

  const [phase, setPhase] = useState<Phase>("playing")
  const [hazardNode, setHazardNode] = useState<string>("")
  
  const [resultTitle, setResultTitle] = useState("")
  const [resultMsg, setResultMsg] = useState("")
  const [resultScore, setResultScore] = useState(0)
  
  useEffect(() => {
    resetTest()
    pickNewHazard()
  }, [])

  const pickNewHazard = () => {
    const room = ROOMS[Math.floor(Math.random() * ROOMS.length)]
    setHazardNode(room.nodeId)
    setPhase("playing")
  }

  const evaluateEvacuation = (selectedExit: string) => {
    const isTargetExit = ["G1", "G2", "G3", "ASSEMBLY"].includes(selectedExit)

    if (!isTargetExit) {
      setResultTitle("0% — Invalid Selection")
      setResultMsg("You didn't select an Exit Gate or the Assembly Area.")
      setResultScore(0)
      setPhase("evaluated")
      addAttempt({
        hazard: hazardNode,
        nearestExit: "",
        selectedExit,
        points: 0,
        pathDrawn: [],
        pathScore: { score: 0, deviation: 999, time: 0, accuracy: "poor" }
      })
      return
    }

    // Calculate straight-line distances to all exits (ignores corrupted pathing network edges)
    const hazardPt = N[hazardNode]
    const exitDistances = ["G1", "G2", "G3", "ASSEMBLY"].reduce((acc, ex) => {
      if (N[ex]) {
        const d = Math.sqrt((N[ex].x - hazardPt.x) ** 2 + (N[ex].y - hazardPt.y) ** 2)
        acc[ex] = d
      }
      return acc
    }, {} as Record<string, number>)

    const minD = Math.min(...Object.values(exitDistances))
    const selectedDist = exitDistances[selectedExit]

    // Allow a 15% tolerance for distances (human visual error margin)
    const isNearest = selectedDist <= minD * 1.15 || Math.abs(selectedDist - minD) < 50
    const score = isNearest ? 100 : 60

    const isAssembly = selectedExit === "ASSEMBLY"
    const exitName = isAssembly ? "Assembly Area" : "Exit Gate"

    if (isNearest) {
      setResultTitle(`100% — Perfect Evacuation!`)
      setResultMsg(`You correctly selected the absolute nearest safe ${exitName}.`)
    } else {
      setResultTitle(`${score}% — Safe Escape!`)
      setResultMsg(`You selected a safe ${exitName}, but there was another exit much closer to the fire.`)
    }

    setResultScore(score)
    setPhase("evaluated")

    addAttempt({
      hazard: hazardNode,
      nearestExit: "Nearest",
      selectedExit,
      points: score,
      pathDrawn: [],
      pathScore: { score, deviation: 0, time: 0, accuracy: score > 80 ? "excellent" : "good" }
    })
  }

  const onExitSelected = (exitNode: string) => {
    evaluateEvacuation(exitNode)
  }

  const handleNextRound = () => {
    if (testData.attempts.length >= testData.totalAttempts) {
      navigate("/result")
    } else {
      pickNewHazard()
    }
  }

  return (
    <LayoutShell>
      <div className="space-y-4 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-indigo-700">
            {phase === "playing" ? t("evacuationInstruction") : t("result")}
          </h2>
          <div className="flex items-center gap-4">
            {import.meta.env.DEV && (
              <button
                onClick={() => setPhase(phase === "edit" ? "playing" : "edit")}
                className="rounded-md bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-300"
              >
                {phase === "edit" ? "Exit Edit Mode" : "Edit Mode"}
              </button>
            )}
            <span className="text-lg font-bold text-indigo-700">
              {t("attempts")} {testData.attempts.length}/{testData.totalAttempts}
            </span>
          </div>
        </div>

        {phase === "playing" && (
          <p className="text-sm text-gray-500 mb-2">
            A fire has broken out! <b>Tap the nearest safe exit</b> (Gates or Assembly Area) to evacuate.
          </p>
        )}

        <div className="relative">
          <PlantMap
            phase={phase}
            hazardNode={hazardNode}
            onExitSelected={onExitSelected}
          />
          
          {phase === "evaluated" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 rounded-xl">
              <div className="rounded-xl bg-white p-8 text-center shadow-2xl max-w-sm">
                <div className="text-5xl mb-2">{resultScore >= 90 ? "🏆" : resultScore > 0 ? "✅" : "❌"}</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">{resultTitle}</h3>
                <p className="mb-6 text-gray-600">{resultMsg}</p>
                <button
                  onClick={handleNextRound}
                  className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white hover:bg-indigo-700 w-full"
                >
                  {testData.attempts.length >= testData.totalAttempts
                    ? t("result") // "View Results"
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
