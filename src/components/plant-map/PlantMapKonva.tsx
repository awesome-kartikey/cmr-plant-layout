import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Stage, Layer, Rect, Circle, Line, Group, Text, Path } from "react-konva"
import { Html } from "react-konva-utils"
import { getGridKey, type GridBlock, findShortestGridPath } from "../../lib/graph"
import { N as initialN, EDGES as initialEdges, INITIAL_COLLISION_ZONES as initialCollisionZones, EXIT_ZONES as initialExitZones, PATH_BLOCKS as initialPathBlocks, buildGraph, projOnSeg, ptDist, EXITS, DEFAULT_GRAPH } from "../../lib/graph"
import type { Point, Segment, GraphNodes, EdgeDef, NodeDef } from "../../lib/graph"
import { FireEffect } from "./FireEffect"
import { DynamicPlantMapBase } from "./DynamicPlantMapBase"
import { toast } from "sonner"

interface PlantMapProps {
  phase: "idle" | "tutorial" | "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"
  hazardNode: string | null
  selectedExit?: string
  drawnPath?: Point[]
  tutorialPath?: Point[]
  setDrawnPath?: (path: Point[]) => void
  onHazardConfirmed?: () => void
  onExitSelected?: (exitNode: string) => void
  onPathComplete?: (path: Point[]) => void
  isWizard?: boolean
  wizardDrawnPaths?: Point[][]
  wizardSelectedExits?: string[]
  showAssemblyReached?: boolean
  showTutorialPath?: boolean
  tutorialKey?: number
}

type EditTool = "drag" | "add" | "connect" | "delete" | "trace"
type EditLayer = "path" | "hazard" | "blocks" | "exits"

export function PlantMapKonva({
  phase,
  hazardNode,
  selectedExit,
  drawnPath = [],
  tutorialPath = [],
  setDrawnPath,
  onHazardConfirmed,
  onExitSelected,
  onPathComplete,
  isWizard,
  wizardDrawnPaths = [],
  wizardSelectedExits = [],
  showAssemblyReached = false,
  showTutorialPath = true,
  tutorialKey = 0,
}: PlantMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 })

  // --- High-Performance Progressive Tutorial Path Drawing Animation Loop ---
  const [animProgress, setAnimProgress] = useState(0)
  const [animOpacity, setAnimOpacity] = useState(1)

  useEffect(() => {
    if (phase !== "tutorial" || !tutorialPath || tutorialPath.length < 2) {
      setAnimProgress(0)
      setAnimOpacity(1)
      return
    }

    let isCancelled = false
    let animFrame: number
    let timeoutId1: any
    let timeoutId2: any

    let tutDist = 0
    for (let i = 0; i < tutorialPath.length - 1; i++) {
      tutDist += ptDist(tutorialPath[i], tutorialPath[i + 1])
    }
    const drawDurationMs = Math.max(1600, (tutDist / 380) * 1000)
    const holdMs = 2400
    const fadeMs = 280

    const startDrawCycle = () => {
      if (isCancelled) return
      setAnimProgress(0)
      setAnimOpacity(1)

      let startTime: number | null = null

      const step = (timestamp: number) => {
        if (isCancelled) return
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const rawProgress = Math.min(1, elapsed / drawDurationMs)

        // Smooth easeInOutCubic
        const eased = rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2

        setAnimProgress(eased)

        if (rawProgress < 1) {
          animFrame = requestAnimationFrame(step)
        } else {
          // Reached Assembly Area: hold for holdMs, then fade out and restart
          timeoutId1 = setTimeout(() => {
            if (isCancelled) return
            setAnimOpacity(0)
            timeoutId2 = setTimeout(() => {
              if (isCancelled) return
              startDrawCycle()
            }, fadeMs)
          }, holdMs)
        }
      }

      animFrame = requestAnimationFrame(step)
    }

    startDrawCycle()

    return () => {
      isCancelled = true
      cancelAnimationFrame(animFrame)
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [phase, tutorialPath])

  // Interpolated sub-path based on current animation progress
  const animatedTutorialPoints = useMemo(() => {
    if (!tutorialPath || tutorialPath.length === 0) return []
    if (tutorialPath.length === 1 || animProgress <= 0) return [tutorialPath[0]]
    if (animProgress >= 1) return tutorialPath

    let totalDist = 0
    const segLens: number[] = []
    for (let i = 0; i < tutorialPath.length - 1; i++) {
      const d = ptDist(tutorialPath[i], tutorialPath[i + 1])
      segLens.push(d)
      totalDist += d
    }

    const targetDist = animProgress * totalDist
    let curDist = 0
    const result: Point[] = [tutorialPath[0]]

    for (let i = 0; i < segLens.length; i++) {
      const len = segLens[i]
      if (curDist + len < targetDist) {
        result.push(tutorialPath[i + 1])
        curDist += len
      } else {
        const rem = targetDist - curDist
        const factor = len > 0 ? rem / len : 0
        const p1 = tutorialPath[i]
        const p2 = tutorialPath[i + 1]
        result.push({
          x: p1.x + (p2.x - p1.x) * factor,
          y: p1.y + (p2.y - p1.y) * factor
        })
        break
      }
    }

    return result
  }, [tutorialPath, animProgress])

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const scaleX = dimensions.width / 1000
  const scaleY = dimensions.height / 600

  // For pointer coordinate transformation, we now need both
  const screenToSVG = useCallback((): Point | null => {
    const stage = stageRef.current
    if (!stage) return null
    const pos = stage.getPointerPosition()
    if (!pos) return null
    return {
      x: pos.x / scaleX,
      y: pos.y / scaleY,
    }
  }, [scaleX, scaleY])

  // Graph State
  const [nodes, setNodes] = useState<GraphNodes>(initialN)
  const [edges, setEdges] = useState<EdgeDef[]>(initialEdges)
  const [collisionZones, setCollisionZones] = useState(initialCollisionZones)
  const [exitZones, setExitZones] = useState(initialExitZones)
  const [dragZone, setDragZone] = useState<{ id: string, type: 'move' | 'resize' } | null>(null)

  // Trace / Move Cursor State (used for edit trace)
  const [traceCursor, setTraceCursor] = useState<Point | null>(null)

  // Edit Mode State
  const [editLayer, setEditLayer] = useState<EditLayer>("path")
  const [editTool, setEditTool] = useState<EditTool>("drag")
  const [dragNode, setDragNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [nodeType, setNodeType] = useState<"corridor" | "room" | "gate" | "assembly">("corridor")
  const [nodeIdInput, setNodeIdInput] = useState("")
  const [nodeNameInput, setNodeNameInput] = useState("")
  const [lastTraceNode, setLastTraceNode] = useState<string | null>(null)

  // Gameplay state
  const [isDrawing, setIsDrawing] = useState(false)

  // Grid Blocks State
  const [pathBlocks, setPathBlocks] = useState<GridBlock[]>(initialPathBlocks)
  const [blockSize, setBlockSize] = useState(20)
  const [isTracingBlocks, setIsTracingBlocks] = useState(false)
  const [evalHazards, setEvalHazards] = useState<any[]>([])
  const [selectedEvalPath, setSelectedEvalPath] = useState<GridBlock[]>([])

  // Toolbar Drag State
  const [toolbarPos, setToolbarPos] = useState({ x: 40, y: 40 })
  const toolbarDragRef = useRef<{ isDragging: boolean; startX: number; startY: number }>({ isDragging: false, startX: 0, startY: 0 })

  // Reset states on phase change
  useEffect(() => {
    if (phase !== "path-draw" && phase !== "edit") {
      setTraceCursor(null)
    }
    if (phase !== "edit") {
      setSelectedNode(null)
      setEditingNode(null)
      setLastTraceNode(null)
    }
  }, [phase])

  // Handle ESC key to break edit trace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "edit" && editTool === "trace") {
          setLastTraceNode(null)
          setTraceCursor(null)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (phase === "edit" || phase === "path-draw") {
          setPathBlocks(prev => prev.length > 0 ? prev.slice(0, -1) : prev)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editTool, phase])



  const isVisibleInLayer = (nodeKey: string) => {
    const n = nodes[nodeKey]
    if (!n) return false
    if (editLayer === "path") return !n.room
    if (editLayer === "hazard") return true
    return true
  }

  const getNodeOpacity = (nodeKey: string) => {
    const n = nodes[nodeKey]
    if (!n) return 0
    if (editLayer === "hazard" && !n.room) return 0.25
    return 1
  }

  const getNodeAtPoint = (pt: Point, threshold = 20) => {
    let best: string | null = null, bd = threshold
    Object.keys(nodes).forEach(k => {
      if (phase === "edit" && !isVisibleInLayer(k)) return
      const d = ptDist(pt, nodes[k])
      if (d < bd) { bd = d; best = k }
    })
    return best
  }

  const checkCollision = (x: number, y: number, buffer: number = 6) => {
    return collisionZones.some(zone =>
      x >= (zone.x + buffer) &&
      x <= (zone.x + zone.width - buffer) &&
      y >= (zone.y + buffer) &&
      y <= (zone.y + zone.height - buffer)
    )
  }

  const onPointerDown = (e: any) => {
    const pt = screenToSVG()
    if (!pt) return

    if (phase === "hazard-confirm") {
      if (hazardNode && nodes[hazardNode]) {
        const d = ptDist(pt, nodes[hazardNode])
        if (d < 45 && onHazardConfirmed) {
          onHazardConfirmed()
        }
      }
      return
    }

    if (phase === "exit-select") {
      const targetNode = getNodeAtPoint(pt, 40)
      if (targetNode && ["G1", "G2", "G3"].includes(targetNode) && onExitSelected) {
        onExitSelected(targetNode)
      }
      return
    }

    if (phase === "path-draw") {
      if (isWizard) {
        const gx = Math.floor(pt.x / blockSize) * blockSize
        const gy = Math.floor(pt.y / blockSize) * blockSize
        const block = { x: gx, y: gy }
        const last = drawnPath[drawnPath.length - 1]
        if (last && last.x === block.x && last.y === block.y) return
        setDrawnPath?.([...drawnPath, block])
        return
      }

      if (checkCollision(pt.x, pt.y)) return // Block start inside collision zone
      setIsDrawing(true)
      setDrawnPath?.([pt])
      return
    }

    if (phase === "edit") {
      if (editLayer === "blocks" || editLayer === "exits") {
        const isExits = editLayer === "exits";
        const setZones = isExits ? setExitZones as any : setCollisionZones as any;
        const zones = isExits ? exitZones : collisionZones;
        if (editTool === "add") {
          const newId = isExits ? `exit-${Date.now()}` : `block-${Date.now()}`;
          setZones([...zones, { id: newId, x: pt.x - 50, y: pt.y - 50, width: 100, height: 100, ...(isExits ? { targetNode: 'G1' } : {}) }])
        } else if (editTool === "delete") {
          const clicked = zones.find((z: any) => pt.x >= z.x && pt.x <= z.x + z.width && pt.y >= z.y && pt.y <= z.y + z.height)
          if (clicked) setZones(zones.filter((z: any) => z.id !== clicked.id))
        } else if (editTool === "drag") {
          const clicked = zones.find((z: any) => pt.x >= z.x && pt.x <= z.x + z.width && pt.y >= z.y && pt.y <= z.y + z.height)
          if (clicked) {
            if (pt.x > clicked.x + clicked.width - 20 && pt.y > clicked.y + clicked.height - 20) {
              setDragZone({ id: clicked.id, type: 'resize' })
            } else {
              setDragZone({ id: clicked.id, type: 'move' })
            }
          }
        }
        return
      }

      const targetNode = getNodeAtPoint(pt)

      if (e.button === 2) {
        if (editTool === "trace") {
          e.preventDefault()
          setLastTraceNode(null)
          setTraceCursor(null)
        }
        return
      }

      if (editTool === "trace") {
        const gx = Math.floor(pt.x / blockSize) * blockSize
        const gy = Math.floor(pt.y / blockSize) * blockSize
        const block = { x: gx, y: gy }

        // Prevent adding duplicate block if it's identical to the last one
        setPathBlocks(prev => {
          const last = prev[prev.length - 1]
          if (last && last.x === block.x && last.y === block.y) return prev
          return [...prev, block]
        })
        return
      }

      if (editTool === "drag" && targetNode) {
        setDragNode(targetNode)
      } else if (editTool === "add" && !targetNode) {
        const newId = `N_${Date.now().toString().slice(-4)}`
        setNodes(prev => ({
          ...prev,
          [newId]: { x: Math.round(pt.x), y: Math.round(pt.y), room: editLayer === "hazard" }
        }))
        setEditingNode(newId)
        setNodeIdInput(newId)
        setNodeType(editLayer === "hazard" ? "room" : "corridor")
      } else if (editTool === "connect" && targetNode) {
        if (!selectedNode) {
          setSelectedNode(targetNode)
        } else {
          if (selectedNode !== targetNode) {
            const exists = edges.find(ed => (ed[0] === selectedNode && ed[1] === targetNode) || (ed[1] === selectedNode && ed[0] === targetNode))
            if (exists) {
              setEdges(prev => prev.filter(ed => ed !== exists))
            } else {
              setEdges(prev => [...prev, [selectedNode, targetNode]])
            }
          }
          setSelectedNode(null)
        }
      } else if (editTool === "delete" && targetNode) {
        setNodes(prev => {
          const next = { ...prev }
          delete next[targetNode]
          return next
        })
        setEdges(prev => prev.filter(ed => ed[0] !== targetNode && ed[1] !== targetNode))
        if (lastTraceNode === targetNode) setLastTraceNode(null)
      } else if (editTool === "drag" && !targetNode) {
        setEditingNode(null)
        setSelectedNode(null)
      }
      return
    }
  }

  const onPointerMove = (e: any) => {
    const pt = screenToSVG()
    if (!pt) return

    if (phase === "path-draw" && isDrawing && drawnPath && !isWizard) {
      if (checkCollision(pt.x, pt.y)) {
        if (drawnPath.length > 0) {
          const lastPt = drawnPath[drawnPath.length - 1]
          // Try sliding horizontally
          if (!checkCollision(pt.x, lastPt.y)) {
            setDrawnPath?.([...drawnPath, { x: pt.x, y: lastPt.y }])
            return
          }
          // Try sliding vertically
          if (!checkCollision(lastPt.x, pt.y)) {
            setDrawnPath?.([...drawnPath, { x: lastPt.x, y: pt.y }])
            return
          }
        }
        return // Stuck, ignore movement but don't cancel drawing
      }
      setDrawnPath?.([...drawnPath, pt])
      return
    }

    if (phase === "edit") {
      if ((editLayer === "blocks" || editLayer === "exits") && dragZone) {
        const isExits = editLayer === "exits";
        const setZones = isExits ? setExitZones as any : setCollisionZones as any;
        setZones((prev: any) => prev.map((z: any) => {
          if (z.id === dragZone.id) {
            if (dragZone.type === 'move') {
              return { ...z, x: pt.x - z.width / 2, y: pt.y - z.height / 2 }
            } else if (dragZone.type === 'resize') {
              return { ...z, width: Math.max(20, pt.x - z.x), height: Math.max(20, pt.y - z.y) }
            }
          }
          return z
        }))
        return
      }
      if (editTool === "trace" && isTracingBlocks) {
        // Disabled drag tracing based on feedback
        // The user wants to click one by one
      }
      if (dragNode && editTool === "drag") {
        e.preventDefault()
        setNodes(prev => ({
          ...prev,
          [dragNode]: { ...prev[dragNode], x: Math.round(pt.x), y: Math.round(pt.y) }
        }))
      }
      return
    }
  }

  const onPointerUp = (e: any) => {
    if (phase === "path-draw" && isDrawing && !isWizard) {
      setIsDrawing(false)
      const assemblyNode = nodes["ASSEMBLY"]
      if (assemblyNode && drawnPath && drawnPath.length > 0) {
        const pt = screenToSVG()
        if (!pt) return
        // Check if released near assembly area
        if (ptDist(pt, assemblyNode) < 120) {
          const firstPoint = drawnPath[0];
          const selectedExitNode = selectedExit ? nodes[selectedExit] : undefined;
          // Ensure they drew a path from the selected exit, and it has some length
          if (firstPoint && selectedExitNode && ptDist(firstPoint, selectedExitNode) > 100) {
            toast.error("Please start drawing your path from the Exit Gate you selected!", { position: "top-center" });
            setDrawnPath?.([]);
            return;
          }
          if (drawnPath.length < 5) {
            toast.error("Path is too short. Please trace the actual route.", { position: "top-center" });
            setDrawnPath?.([]);
            return;
          }

          if (onPathComplete) onPathComplete(drawnPath)
        }
      }
      return
    }
    setIsDrawing(false)
    if (phase === "edit") {
      setIsTracingBlocks(false)
      if (editLayer === "blocks" || editLayer === "exits") {
        setDragZone(null)
      }
      if (dragNode) {
        if (editTool === "drag") {
          const pt = screenToSVG()
          if (!pt) return
          const targetNode = getNodeAtPoint(pt)
          if (targetNode === dragNode) {
            setEditingNode(targetNode)
            setNodeIdInput(targetNode)
            const n = nodes[targetNode]
            if (n.room) setNodeType("room")
            else if (n.gate) setNodeType("gate")
            else if (n.target) setNodeType("assembly")
            else setNodeType("corridor")
            setNodeNameInput(n.name || "")
          }
        }
      }
      setDragNode(null)
      return
    }
  }

  const handleExport = () => {
    let str = "export const N: GraphNodes = {\n"
    Object.keys(nodes).forEach(k => {
      const n = nodes[k]
      let props = `x: ${n.x}, y: ${n.y}`
      if (n.room) props += `, room: true`
      if (n.target) props += `, target: true`
      if (n.gate) props += `, gate: true`
      if (n.name) props += `, name: "${n.name}"`
      str += `  ${k}: { ${props} },\n`
    })
    str += "}\n\nexport const EDGES: EdgeDef[] = [\n"
    let i = 0
    while (i < edges.length) {
      str += "  "
      for (let j = 0; j < 6 && i < edges.length; j++, i++) {
        str += `["${edges[i][0]}", "${edges[i][1]}"], `
      }
      str += "\n"
    }
    str += "]\n\n"
    str += "export const INITIAL_COLLISION_ZONES = [\n"
    collisionZones.forEach(z => {
      str += `  { id: '${z.id}', x: ${Math.round(z.x)}, y: ${Math.round(z.y)}, width: ${Math.round(z.width)}, height: ${Math.round(z.height)} },\n`
    })
    str += "]\n\n"
    str += "export const EXIT_ZONES = [\n"
    exitZones.forEach(z => {
      str += `  { id: '${z.id}', x: ${Math.round(z.x)}, y: ${Math.round(z.y)}, width: ${Math.round(z.width)}, height: ${Math.round(z.height)}, targetNode: '${(z as any).targetNode}' },\n`
    })
    str += "]\n\n"
    str += "export const PATH_BLOCKS = [\n"
    pathBlocks.forEach(b => {
      str += `  { x: ${b.x}, y: ${b.y} },\n`
    })
    str += "]"

    navigator.clipboard.writeText(str).then(() => alert("Code copied to clipboard!"))
  }

  const saveNodeEdit = () => {
    if (!editingNode) return

    let newId = nodeIdInput.trim()
    if (!newId) newId = editingNode

    setNodes(prev => {
      const next = { ...prev }
      const oldData = next[editingNode]
      delete next[editingNode]

      const newData: NodeDef = { x: oldData.x, y: oldData.y }
      if (nodeType === "room") newData.room = true
      if (nodeType === "gate") newData.gate = true
      if (nodeType === "assembly") newData.target = true
      if (nodeNameInput.trim()) newData.name = nodeNameInput.trim()

      next[newId] = newData
      return next
    })

    if (newId !== editingNode) {
      setEdges(prev => prev.map(ed => {
        let a = ed[0], b = ed[1]
        if (a === editingNode) a = newId
        if (b === editingNode) b = newId
        return [a, b]
      }))
    }

    setEditingNode(null)
  }

  const handleToolbarPointerDown = (e: any) => {
    toolbarDragRef.current = {
      isDragging: true,
      startX: e.clientX - toolbarPos.x,
      startY: e.clientY - toolbarPos.y
    }
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const handleToolbarPointerMove = (e: any) => {
    if (toolbarDragRef.current.isDragging) {
      setToolbarPos({
        x: e.clientX - toolbarDragRef.current.startX,
        y: e.clientY - toolbarDragRef.current.startY
      })
    }
  }
  const handleToolbarPointerUp = (e: any) => {
    toolbarDragRef.current.isDragging = false
      ; (e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleRunEvaluation = () => {
    const allBlocks = pathBlocks;
    if (allBlocks.length === 0) return;

    const exitBlocks: GridBlock[] = [];
    const hazards: { id: string, name: string, startBlock: GridBlock }[] = [];

    Object.keys(nodes).forEach(k => {
      const n = nodes[k];
      if (n.room || n.gate || n.target) {
        let bestB: GridBlock | null = null;
        let minDist = 100;
        allBlocks.forEach(b => {
          const d = ptDist(n, b);
          if (d < minDist) {
            minDist = d;
            bestB = b;
          }
        });

        if (bestB) {
          if (n.gate || n.target) {
            exitBlocks.push(bestB);
          } else if (n.room) {
            hazards.push({ id: k, name: n.name || k, startBlock: bestB });
          }
        }
      }
    });

    const results = hazards.map(hz => {
      const path = findShortestGridPath(allBlocks, hz.startBlock, exitBlocks, blockSize);
      return {
        id: hz.id,
        name: hz.name,
        path: path,
        score: path ? path.length : Infinity
      }
    });

    results.sort((a, b) => {
      if (a.score === Infinity) return 1;
      if (b.score === Infinity) return -1;
      return a.score - b.score;
    });

    setEvalHazards(results);
  };


  return (
    <div className="flex flex-row w-full h-full justify-center items-center overflow-hidden p-0">
      <div
        className="relative w-full h-full max-w-full max-h-full aspect-[1000/600] rounded-xl overflow-hidden shadow-sm bg-white border border-slate-200 select-none flex items-center justify-center"
        onContextMenu={(e) => {
          if (phase === "edit" && editTool === "trace") {
            e.preventDefault()
            setLastTraceNode(null)
            setTraceCursor(null)
          }
        }}
      >
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-10 touch-none">
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scaleX}
            scaleY={scaleY}
            pixelRatio={typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* 1. Static Base Map Layer (Zero re-draws during animation) */}
            <Layer id="base-map-layer" listening={false}>
              <DynamicPlantMapBase
                phase={phase}
                hazardNode={hazardNode}
                selectedExit={selectedExit}
                isWizard={isWizard}
                wizardSelectedExits={wizardSelectedExits}
              />
            </Layer>

            {/* 2. Interactive & Gameplay Elements Layer */}
            <Layer id="interactive-layer">
              {edges.map((edge, i) => {
                const n1 = nodes[edge[0]]
                const n2 = nodes[edge[1]]
                if (!n1 || !n2) return null
                return (
                  <Line
                    key={`edge-${i}`}
                    points={[n1.x, n1.y, n2.x, n2.y]}
                    stroke={phase === "edit" ? "#cbd5e1" : "transparent"}
                    strokeWidth={phase === "edit" ? 2 : 0}
                    dash={[5, 5]}
                    hitStrokeWidth={0}
                    listening={false}
                  />
                )
              })}

              {/* Render Grid Blocks */}
              {((phase === "edit" && editLayer === "path") || isWizard) && pathBlocks.map((b, idx) => (
                <Rect key={`pb-${idx}-${getGridKey(b)}`} x={b.x} y={b.y} width={blockSize} height={blockSize} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth={1} listening={false} />
              ))}
              {/* Render Selected Eval Path */}
              {phase === "evaluated" && selectedEvalPath.map(b => (
                <Rect key={`eval-${getGridKey(b)}`} x={b.x} y={b.y} width={blockSize} height={blockSize} fill="rgba(16, 185, 129, 0.6)" stroke="#10b981" strokeWidth={2} listening={false} />
              ))}
              {/* Render Wizard Drawn Paths (Vector Lines + Waypoints) */}
              {isWizard && wizardDrawnPaths.map((path, pathIdx) => {
                const colors = [
                  { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.4)" }, // Green
                  { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" }, // Orange
                  { stroke: "#0ea5e9", glow: "rgba(14, 165, 233, 0.4)" }  // Blue
                ]
                const c = colors[pathIdx] || colors[0]
                if (path.length === 0) return null
                return (
                  <Group key={`wizard-path-${pathIdx}`}>
                    {path.length > 1 && (
                      <Line
                        points={path.flatMap(p => [p.x + (pathIdx * 2), p.y + (pathIdx * 2)])}
                        stroke={c.stroke}
                        strokeWidth={5}
                        lineCap="round"
                        lineJoin="round"
                        listening={false}
                      />
                    )}
                    {path.map((b, idx) => (
                      <Circle
                        key={`wp-${pathIdx}-${idx}`}
                        x={b.x + (pathIdx * 2)}
                        y={b.y + (pathIdx * 2)}
                        r={4}
                        fill={c.stroke}
                        stroke="white"
                        strokeWidth={1}
                        listening={false}
                      />
                    ))}
                  </Group>
                )
              })}

              {/* Render Active Wizard Tracing Line + Waypoint Handles */}
              {isWizard && phase === "path-draw" && drawnPath.length > 0 && (
                <Group key="active-wizard-tracing">
                  {drawnPath.length > 1 && (
                    <Line
                      points={drawnPath.flatMap(p => [p.x, p.y])}
                      stroke="#059669"
                      strokeWidth={5.5}
                      lineCap="round"
                      lineJoin="round"
                      shadowColor="#059669"
                      shadowBlur={8}
                      listening={false}
                    />
                  )}
                  {drawnPath.map((pt, idx) => {
                    const isStart = idx === 0
                    const isEnd = idx === drawnPath.length - 1
                    return (
                      <Group key={`wizard-pt-${idx}`}>
                        <Circle
                          x={pt.x}
                          y={pt.y}
                          r={isStart || isEnd ? 7 : 5}
                          fill={isStart ? "#FDF4FF" : isEnd ? "#10B981" : "#FFFFFF"}
                          stroke={isStart ? "#D946EF" : "#059669"}
                          strokeWidth={2.5}
                          shadowColor={isEnd ? "#10B981" : "#059669"}
                          shadowBlur={6}
                          listening={false}
                        />
                        {isStart && (
                          <Circle
                            x={pt.x}
                            y={pt.y}
                            r={12}
                            stroke="#D946EF"
                            strokeWidth={1}
                            dash={[3, 3]}
                            listening={false}
                          />
                        )}
                      </Group>
                    )
                  })}
                </Group>
              )}

              {/* Render Fire Hazard Effect */}
              {hazardNode && nodes[hazardNode] && (
                <Html
                  groupProps={{
                    x: nodes[hazardNode].x - 30,
                    y: nodes[hazardNode].y - 30,
                  }}
                  divProps={{
                    style: {
                      pointerEvents: phase === "hazard-confirm" ? "auto" : "none",
                      cursor: phase === "hazard-confirm" ? "pointer" : "default",
                    },
                  }}
                >
                  <div
                    onClick={() => {
                      if (phase === "hazard-confirm" && onHazardConfirmed) {
                        onHazardConfirmed()
                      }
                    }}
                  >
                    <FireEffect size={60} />
                  </div>
                </Html>
              )}

              {/* Render Exit Click Zones */}
              {exitZones.map((zone) => {
                const isSelected = selectedExit === zone.id || selectedExit === zone.targetNode
                const isWizardSelected = isWizard && wizardSelectedExits.includes(zone.id)
                return (
                  <Group key={zone.id}>
                    <Rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      fill="transparent"
                      stroke={
                        editLayer === "exits"
                          ? "#10b981"
                          : isSelected || isWizardSelected
                            ? "#10b981"
                            : phase === "exit-select"
                              ? "#22c55e"
                              : "transparent"
                      }
                      strokeWidth={isSelected || isWizardSelected ? 3 : phase === "exit-select" ? 2 : 1}
                      dash={phase === "exit-select" ? [4, 4] : undefined}
                      draggable={editLayer === "exits" && editTool === "drag"}
                      onDragEnd={(e) => {
                        const newExits = exitZones.map(z =>
                          z.id === zone.id
                            ? { ...z, x: Math.round(e.target.x()), y: Math.round(e.target.y()) }
                            : z
                        )
                        setExitZones(newExits)
                      }}
                      onClick={() => {
                        if (phase === "exit-select" && !isWizardSelected && onExitSelected) {
                          onExitSelected(zone.targetNode || zone.id)
                        }
                      }}
                      onTap={() => {
                        if (phase === "exit-select" && !isWizardSelected && onExitSelected) {
                          onExitSelected(zone.targetNode || zone.id)
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (phase === "exit-select" && !isWizardSelected) {
                          const container = e.target.getStage()?.container()
                          if (container) container.style.cursor = 'pointer'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (phase === "exit-select" && !isWizardSelected) {
                          const container = e.target.getStage()?.container()
                          if (container) container.style.cursor = 'default'
                        }
                      }}
                    />
                  </Group>
                )
              })}
            </Layer>

            {/* 3. Lightweight Tutorial Animation Layer (60-120 FPS High Performance) */}
            <Layer id="tutorial-anim-layer" opacity={animOpacity} listening={false}>
              {phase === "tutorial" && animatedTutorialPoints && animatedTutorialPoints.length > 0 && (
                <Group key="tut-path-anim-group">
                  {/* Outer Ambient Glow */}
                  {animatedTutorialPoints.length > 1 && (
                    <Line
                      points={animatedTutorialPoints.flatMap(p => [p.x, p.y])}
                      stroke="rgba(217, 70, 239, 0.45)"
                      strokeWidth={14}
                      lineCap="round"
                      lineJoin="round"
                      shadowColor="#D946EF"
                      shadowBlur={14}
                      listening={false}
                    />
                  )}
                  {/* Core Neon Pink Line */}
                  {animatedTutorialPoints.length > 1 && (
                    <Line
                      points={animatedTutorialPoints.flatMap(p => [p.x, p.y])}
                      stroke="#D946EF"
                      strokeWidth={6.5}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                  )}
                  {/* Start Point Marker */}
                  <Circle
                    x={tutorialPath[0].x}
                    y={tutorialPath[0].y}
                    r={7}
                    fill="#FDF4FF"
                    stroke="#D946EF"
                    strokeWidth={3}
                    listening={false}
                  />
                  {/* Leading Spark / Runner Head Cursor */}
                  {animProgress > 0 && animProgress < 1 && animatedTutorialPoints.length > 0 && (() => {
                    const leadPt = animatedTutorialPoints[animatedTutorialPoints.length - 1]
                    return (
                      <Group>
                        <Circle
                          x={leadPt.x}
                          y={leadPt.y}
                          r={14}
                          fill="rgba(217, 70, 239, 0.3)"
                          listening={false}
                        />
                        <Circle
                          x={leadPt.x}
                          y={leadPt.y}
                          r={6}
                          fill="#FFFFFF"
                          stroke="#D946EF"
                          strokeWidth={2}
                          shadowColor="#D946EF"
                          shadowBlur={8}
                          listening={false}
                        />
                      </Group>
                    )
                  })()}
                  {/* End Point Marker (Assembly) */}
                  {animProgress >= 0.98 && tutorialPath.length > 0 && (
                    <Circle
                      x={tutorialPath[tutorialPath.length - 1].x}
                      y={tutorialPath[tutorialPath.length - 1].y}
                      r={8}
                      fill="#FDF4FF"
                      stroke="#10B981"
                      strokeWidth={3}
                      listening={false}
                    />
                  )}
                  {/* Assembly Area Pulse Effect */}
                  {animProgress >= 0.98 && (
                    <Circle
                      x={713}
                      y={568}
                      r={24}
                      fill="rgba(34,197,94,0.35)"
                      stroke="#22C55E"
                      strokeWidth={3}
                      listening={false}
                    />
                  )}
                </Group>
              )}
            </Layer>

            {/* 4. Edit Mode & Interaction Nodes Layer */}
            <Layer id="edit-nodes-layer">

              {/* Render Traced Neon Evacuation Path (Gameplay mode) */}
              {phase === "path-draw" && drawnPath && drawnPath.length > 0 && (
                <Group>
                  <Path data={drawnPath.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                    fill="transparent"
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeLinejoin="round"

                    listening={false}
                  />
                  <Path data={drawnPath.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    listening={false}
                  />
                </Group>
              )}

              {/* Render Nodes */}
              {Object.keys(nodes).map(k => {
                const n = nodes[k]
                if (phase === "edit") {
                  if (!isVisibleInLayer(k)) return null

                  let fillColor = "#3b82f6" // Corridor
                  if (n.room) fillColor = "#ef4444" // Room
                  else if (n.gate) fillColor = "#10b981" // Gate
                  else if (n.target) fillColor = "#fbbf24" // Assembly

                  const isSelected = selectedNode === k || editingNode === k || lastTraceNode === k
                  const opacity = getNodeOpacity(k)

                  return (
                    <Group key={k} opacity={opacity}>
                      <Circle cx={n.x} cy={n.y} r={isSelected ? "14" : "10"} fill={fillColor} stroke="white" strokeWidth={2} />
                      {isSelected && <Circle cx={n.x} cy={n.y} r={18} fill="transparent" stroke="white" strokeWidth={1} strokeDasharray="4 2" />}
                      <Text x={n.x} y={n.y - 18}
                        align="center"
                        fill="white"
                        fontSize={16}
                        fontStyle="bold"
                        listening={false}
                        stroke="black"
                        strokeWidth={3}
                        text={k}
                      />
                    </Group>
                  )
                }

                if (n.target) {
                  const isTargetDest = phase === "path-draw"
                  return (
                    <Group key={k}>
                      {isTargetDest && (
                        <Circle cx={n.x}
                          cy={n.y}
                          r={45}
                          fill="transparent"
                          stroke="#fbbf24"
                          strokeWidth={2}
                        />
                      )}
                      <Circle cx={n.x} cy={n.y} r={32} fill="rgba(251,191,36,0.15)" />
                      <Circle cx={n.x} cy={n.y} r={20} stroke="#fbbf24" strokeWidth={2} fill="transparent" />
                      <Text x={n.x} y={n.y} offsetX={10} offsetY={10} align="center" fontSize={20} listening={false} text="⭐" />
                    </Group>
                  )
                }

                if (n.gate) {
                  const isBlinkingExit = phase === "exit-select" && ["G1", "G2", "G3"].includes(k) && exitZones.length === 0
                  return (
                    <Group key={k} >
                      {isBlinkingExit && (
                        <Circle cx={n.x}
                          cy={n.y}
                          r={36}
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      )}
                      <Circle cx={n.x} cy={n.y} r={24} fill={isBlinkingExit ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.15)"} />
                      <Circle cx={n.x} cy={n.y} r={15} stroke="#10b981" strokeWidth={2.5} fill="transparent" />
                      <Text x={n.x} y={n.y + 5} align="center" fontSize={15} listening={false} text="🚪" />
                    </Group>
                  )
                }
                return null
              })}

              {/* SVG-based Fire indicator */}
              {hazardNode && nodes[hazardNode] && (phase === "tutorial" || phase === "hazard-confirm" || phase === "exit-select" || phase === "path-draw" || phase === "evaluated") && (
                <Group listening={false}>
                  {/* Outer red warning pulse */}
                  <Circle cx={nodes[hazardNode].x}
                    cy={nodes[hazardNode].y}
                    r={40}
                    fill="rgba(239, 68, 68, 0.25)"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />

                  {/* Hazard Confirm Arrow Helper */}
                  {phase === "hazard-confirm" && (
                    <Html groupProps={{ x: nodes[hazardNode].x - 60, y: nodes[hazardNode].y + 35 }} divProps={{ style: { pointerEvents: 'none' } }}>
                      <div className="flex flex-col items-center justify-center animate-bounce w-[120px]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900 drop-shadow-md mb-1">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700">
                          Click to Confirm
                        </div>
                      </div>
                    </Html>
                  )}

                  <Circle cx={nodes[hazardNode].x}
                    cy={nodes[hazardNode].y}
                    r={22}
                    fill="rgba(239, 68, 68, 0.4)"
                  />
                  {/* Canvas fire effect inside SVG using foreignObject (larger size to prevent particles going outside canvas bounds) */}
                  <Html
                    groupProps={{ x: nodes[hazardNode].x - 40, y: nodes[hazardNode].y - 65 }}
                    divProps={{ style: { pointerEvents: 'none' } }}
                  >
                    <div className="pointer-events-none">
                      <FireEffect size={80} />
                    </div>
                  </Html>
                </Group>
              )}



            </Layer>
          </Stage>
        </div>
      </div>

      {/* Edit Mode Toolbar - Fixed Right Side */}
      {phase === "edit" && (
        <div className="w-80 shrink-0 bg-black/90 rounded-lg border border-gray-700 shadow-2xl flex flex-col overflow-hidden max-h-[80vh] overflow-y-auto z-50">
          <div className="bg-gray-800 text-gray-400 text-xs px-2 py-3 text-center font-bold flex justify-between items-center">
            <span>≡ Edit Mode ≡</span>
          </div>

          <div className="p-4 flex flex-col gap-6">

            {/* Map Layers Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Visibility Layers</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditLayer("hazard")}
                  className={`px-2 py-2 text-xs font-bold rounded transition-colors ${editLayer === "hazard" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  🔥 Hazards
                </button>
                <button
                  onClick={() => setEditLayer("exits")}
                  className={`px-2 py-2 text-xs font-bold rounded transition-colors ${editLayer === "exits" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  🚪 Exits
                </button>
                <button
                  onClick={() => setEditLayer("blocks")}
                  className={`px-2 py-2 text-xs font-bold rounded transition-colors ${editLayer === "blocks" ? "bg-orange-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  🧱 Walls (Collisions)
                </button>
                <button
                  onClick={() => setEditLayer("path")}
                  className={`px-2 py-2 text-xs font-bold rounded transition-colors ${editLayer === "path" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  🟩 Path Grid
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-800" />

            {/* Node Edit Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Node Management</h4>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setEditTool("drag")} className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-colors ${editTool === "drag" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                  🖐 Move
                </button>
                <button onClick={() => setEditTool("add")} className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-colors ${editTool === "add" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                  ➕ Add
                </button>
                <button onClick={() => setEditTool("delete")} className={`flex-1 px-3 py-2 rounded text-xs font-bold transition-colors ${editTool === "delete" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                  🗑 Delete
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-800" />

            {/* Path Drawing Section */}
            <div className="space-y-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Master Path Drawing</h4>
              <button
                onClick={() => setEditTool("trace")}
                className={`w-full px-3 py-2 rounded text-xs font-bold transition-colors shadow-lg ${editTool === "trace" ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
              >
                🟩 Draw Block Path
              </button>

              {editTool === "trace" && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <label className="font-bold">Block Size:</label>
                    <span className="font-mono bg-black px-1 rounded">{blockSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={blockSize}
                    onChange={(e) => setBlockSize(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() => setPathBlocks(prev => prev.length > 0 ? prev.slice(0, -1) : prev)}
                    className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>↩️ Undo Last Block (Ctrl+Z)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4">
              <button onClick={handleExport} className="w-full px-3 py-3 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-900/20">
                📋 Export Map Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Properties Editor Modal */}
      {phase === "edit" && editingNode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-white p-4 rounded-lg shadow-2xl border border-gray-200 w-80">
          <h3 className="font-bold text-gray-800 mb-4">Edit Node Properties</h3>

          <label className="block text-xs font-semibold text-gray-600 mb-1">Node ID</label>
          <input
            type="text"
            value={nodeIdInput}
            onChange={(e) => setNodeIdInput(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 text-sm font-mono"
          />

          <label className="block text-xs font-semibold text-gray-600 mb-1">Node Name</label>
          <input
            type="text"
            value={nodeNameInput}
            onChange={(e) => setNodeNameInput(e.target.value)}
            placeholder="e.g. Hot Refining Area"
            className="w-full border rounded px-3 py-2 mb-4 text-sm"
          />

          <label className="block text-xs font-semibold text-gray-600 mb-1">Node Type</label>
          <select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value as any)}
            className="w-full border rounded px-3 py-2 mb-4 text-sm"
          >
            <option value="corridor">Corridor (Path)</option>
            <option value="room">Room (Hazard)</option>
            <option value="gate">Exit Gate</option>
            <option value="assembly">Assembly Area</option>
          </select>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditingNode(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button onClick={saveNodeEdit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
          </div>
        </div>
      )}


    </div>
  )
}
