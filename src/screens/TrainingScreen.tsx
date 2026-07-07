import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTest } from "../contexts/TestContext"
import { LayoutShell } from "../components/shared/LayoutShell"
import { PlantMap, DEPARTMENTS, EXITS, NEAREST_EXIT, ASSEMBLY_AREA } from "../components/plant-map/PlantMap"
import { FireEffect } from "../components/plant-map/FireEffect"
import { PathCanvas } from "../components/plant-map/PathCanvas"
import { scoreDrawnPath } from "../lib/scoring"
import type { Point } from "../types"

const HAZARD_IDS = DEPARTMENTS.map((d) => d.id)

function getDepartmentCenter(id: string) {
  const dept = DEPARTMENTS.find((d) => d.id === id)
  if (!dept) return { x: 600, y: 400 }
  return { x: dept.x + dept.w / 2, y: dept.y + dept.h / 2 }
}

function getExitCoords(id: string) {
  const exit = EXITS.find((e) => e.id === id)
  if (!exit) return { x: 600, y: 400 }
  return { x: exit.x + 10, y: exit.y + 14 }
}

export default function TrainingScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addAttempt, testData, resetTest } = useTest()

  const [phase, setPhase] = useState<"hazard" | "exit" | "path" | "done">("hazard")
  const [hazardId, setHazardId] = useState<string>("")
  const [selectedExit, setSelectedExit] = useState<string>("")
  const [drawnPath, setDrawnPath] = useState<Point[]>([])
  const [pathTime, setPathTime] = useState(0)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    resetTest()
  }, [])

  useEffect(() => {
    const id = HAZARD_IDS[Math.floor(Math.random() * HAZARD_IDS.length)]
    setHazardId(id)
  }, [])

  useEffect(() => {
    if (phase !== "exit") return
    const interval = setInterval(() => setBlink((b) => !b), 500)
    return () => clearInterval(interval)
  }, [phase])

  const onTapHazard = useCallback(() => {
    if (phase !== "hazard") return
    setPhase("exit")
  }, [phase])

  const onSelectExit = useCallback((exitId: string) => {
    if (phase !== "exit") return
    setSelectedExit(exitId)
    setPhase("path")
  }, [phase])

  const onPathComplete = useCallback((path: Point[], timeSeconds: number) => {
    if (phase !== "path") return
    setDrawnPath(path)
    setPathTime(timeSeconds)
    setPhase("done")
  }, [phase])

  const onFinishAttempt = useCallback(() => {
    const nearest = NEAREST_EXIT[hazardId]
    const isCorrect = selectedExit === nearest
    const exitPoints = isCorrect ? 10 : 2

    const fireCenter = getDepartmentCenter(hazardId)
    const exitCoords = getExitCoords(selectedExit)

    const referencePath: Point[] = [
      exitCoords,
      { x: exitCoords.x, y: ASSEMBLY_AREA.y + ASSEMBLY_AREA.h + 20 },
      { x: ASSEMBLY_AREA.x + ASSEMBLY_AREA.w / 2, y: ASSEMBLY_AREA.y + ASSEMBLY_AREA.h + 20 },
      { x: ASSEMBLY_AREA.x + ASSEMBLY_AREA.w / 2, y: ASSEMBLY_AREA.y + ASSEMBLY_AREA.h / 2 },
    ]

    const pathResult = drawnPath.length > 1
      ? scoreDrawnPath(drawnPath, referencePath, pathTime)
      : { score: 0, deviation: 999, time: pathTime, accuracy: "poor" as const }

    const pathScore = pathResult.score > 50 ? pathResult.score : 0
    const totalPoints = exitPoints + Math.round(pathScore / 10)

    addAttempt({
      hazard: hazardId,
      nearestExit: nearest,
      selectedExit,
      points: totalPoints,
      pathDrawn: drawnPath,
      pathScore: pathResult,
    })

    if (testData.attempts.length + 1 >= testData.totalAttempts) {
      navigate("/result")
    } else {
      setPhase("hazard")
      setSelectedExit("")
      setDrawnPath([])
      setPathTime(0)
      const newId = HAZARD_IDS[Math.floor(Math.random() * HAZARD_IDS.length)]
      setHazardId(newId)
    }
  }, [hazardId, selectedExit, drawnPath, pathTime, testData.attempts.length, addAttempt, navigate])

  const fireCenter = getDepartmentCenter(hazardId)

  return (
    <LayoutShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-indigo-700">
            {phase === "hazard" && t("hazardInstruction")}
            {phase === "exit" && t("evacuationInstruction")}
            {phase === "path" && t("drawPathInstruction")}
            {phase === "done" && t("result")}
          </h2>
          <span className="text-lg font-bold text-indigo-700">
            {t("attempts")} {testData.attempts.length + 1}/{testData.totalAttempts}
          </span>
        </div>

        <div className="relative mx-auto" style={{ maxWidth: 1200 }}>
          <PlantMap hazardId={hazardId} showExits={true}>
            {phase === "exit" && EXITS.map((exit) => (
              <g key={exit.id} onClick={() => onSelectExit(exit.id)} className="cursor-pointer">
                <rect x={exit.x - 8} y={exit.y - 8} width="36" height="44"
                  fill={blink ? "rgba(22,163,74,0.3)" : "rgba(22,163,74,0.1)"}
                  stroke="#16a34a" strokeWidth="2" rx="6" />
                <rect x={exit.x} y={exit.y} width="20" height="28"
                  fill="white" stroke="#16a34a" strokeWidth="3" rx="3" />
                <circle cx={exit.x + 10} cy={exit.y + 14} r="3" fill="#16a34a" />
                <text x={exit.x + 10} y={exit.y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#16a34a">
                  {exit.label}
                </text>
              </g>
            ))}
          </PlantMap>

          {phase === "hazard" && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={onTapHazard}
            />
          )}

          {phase === "hazard" && (
            <FireEffect x={fireCenter.x} y={fireCenter.y} size={50} />
          )}

          <PathCanvas
            key={`path-${phase}-${selectedExit}`}
            onPathComplete={onPathComplete}
            enabled={phase === "path"}
          />

          {phase === "done" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
              <div className="rounded-xl bg-white p-8 text-center shadow-2xl">
                <p className="mb-4 text-2xl font-bold text-green-600">
                  ✓ Path Complete
                </p>
                <p className="mb-2 text-gray-600">
                  Path drawn in {pathTime.toFixed(1)}s
                </p>
                <p className="mb-6 text-gray-600">
                  {drawnPath.length} points recorded
                </p>
                <button
                  onClick={onFinishAttempt}
                  className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white hover:bg-indigo-700"
                >
                  {testData.attempts.length + 1 >= testData.totalAttempts
                    ? t("result")
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
