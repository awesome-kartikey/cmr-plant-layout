import { useRef, useState, useCallback } from "react"
import type { Point } from "../../types"

interface PathCanvasProps {
  onPathComplete: (path: Point[], timeSeconds: number) => void
  enabled: boolean
}

export function PathCanvas({ onPathComplete, enabled }: PathCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [path, setPath] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const startTimeRef = useRef(0)

  const screenToSVG = useCallback((e: React.PointerEvent): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    return {
      x: ((e.clientX - rect.left) / rect.width) * viewBox.width,
      y: ((e.clientY - rect.top) / rect.height) * viewBox.height,
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled) return
    e.preventDefault()
    setIsDrawing(true)
    startTimeRef.current = Date.now()
    setPath([screenToSVG(e)])
  }, [enabled, screenToSVG])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !enabled) return
    e.preventDefault()
    setPath((prev) => [...prev, screenToSVG(e)])
  }, [isDrawing, enabled, screenToSVG])

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    const timeSeconds = (Date.now() - startTimeRef.current) / 1000
    onPathComplete(path, timeSeconds)
  }, [isDrawing, onPathComplete, path])

  if (!enabled && path.length === 0) return null

  const pathD = path.length > 1
    ? path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
    : ""

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 800"
      className="absolute inset-0 z-20"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {pathD && (
        <path d={pathD} stroke="#2563eb" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeOpacity={0.8} />
      )}
      {path.length > 0 && (
        <circle cx={path[0].x} cy={path[0].y} r="6" fill="#2563eb" />
      )}
      {path.length > 1 && (
        <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r="6" fill="#dc2626" />
      )}
    </svg>
  )
}
