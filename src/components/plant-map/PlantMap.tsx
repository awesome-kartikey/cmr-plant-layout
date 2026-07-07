import { useState, useRef, useCallback, useEffect } from "react"
import { N as initialN, EDGES as initialEdges, INITIAL_COLLISION_ZONES as initialCollisionZones, buildGraph, projOnSeg, ptDist, EXITS, DEFAULT_GRAPH } from "../../lib/graph"
import type { Point, Segment, GraphNodes, EdgeDef, NodeDef } from "../../lib/graph"
import { FireEffect } from "./FireEffect"

interface PlantMapProps {
  phase: "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"
  hazardNode: string | null
  selectedExit?: string
  drawnPath?: Point[]
  setDrawnPath?: (path: Point[]) => void
  onHazardConfirmed?: () => void
  onExitSelected?: (exitNode: string) => void
  onPathComplete?: (path: Point[]) => void
}

type EditTool = "drag" | "add" | "connect" | "delete" | "trace"
type EditLayer = "path" | "hazard" | "blocks"

export function PlantMap({ 
  phase, 
  hazardNode, 
  selectedExit, 
  drawnPath = [], 
  setDrawnPath, 
  onHazardConfirmed, 
  onExitSelected, 
  onPathComplete 
}: PlantMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Graph State
  const [nodes, setNodes] = useState<GraphNodes>(initialN)
  const [edges, setEdges] = useState<EdgeDef[]>(initialEdges)
  const [collisionZones, setCollisionZones] = useState(initialCollisionZones)
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
  const [lastTraceNode, setLastTraceNode] = useState<string | null>(null)
  
  // Gameplay state
  const [isDrawing, setIsDrawing] = useState(false)

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
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editTool, phase])

  const screenToSVG = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    
    let cx = 0, cy = 0
    if ('clientX' in e) {
      cx = (e as React.MouseEvent).clientX
      cy = (e as React.MouseEvent).clientY
    } else if ('touches' in e && e.touches.length > 0) {
      cx = (e as React.TouchEvent).touches[0].clientX
      cy = (e as React.TouchEvent).touches[0].clientY
    }
    
    return {
      x: ((cx - rect.left) / rect.width) * viewBox.width,
      y: ((cy - rect.top) / rect.height) * viewBox.height,
    }
  }, [])

  const isVisibleInLayer = (nodeKey: string) => {
    const n = nodes[nodeKey]
    if (!n) return false
    if (editLayer === "path") return !n.room
    if (editLayer === "hazard") return true 
    return true
  }

  const getNodeOpacity = (nodeKey: string) => {
    const n = nodes[nodeKey]
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

  const checkCollision = (x: number, y: number) => {
    return collisionZones.some(zone => 
      x >= zone.x && 
      x <= zone.x + zone.width && 
      y >= zone.y && 
      y <= zone.y + zone.height
    )
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const pt = screenToSVG(e)
    
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
      if (checkCollision(pt.x, pt.y)) return // Block start inside collision zone
      setIsDrawing(true)
      setDrawnPath?.([pt])
      return
    }
    
    if (phase === "edit") {
      if (editLayer === "blocks") {
        if (editTool === "add") {
          const newId = `block-${Date.now()}`
          setCollisionZones([...collisionZones, { id: newId, x: pt.x - 50, y: pt.y - 50, width: 100, height: 100 }])
        } else if (editTool === "delete") {
          const clicked = collisionZones.find(z => pt.x >= z.x && pt.x <= z.x + z.width && pt.y >= z.y && pt.y <= z.y + z.height)
          if (clicked) setCollisionZones(collisionZones.filter(z => z.id !== clicked.id))
        } else if (editTool === "drag") {
          const clicked = collisionZones.find(z => pt.x >= z.x && pt.x <= z.x + z.width && pt.y >= z.y && pt.y <= z.y + z.height)
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
        let activeNode: string | null = targetNode
        if (!activeNode) {
          const newId = `P_${Date.now().toString().slice(-4)}`
          setNodes(prev => ({ 
            ...prev, 
            [newId]: { x: Math.round(pt.x), y: Math.round(pt.y), room: editLayer === "hazard" } 
          }))
          activeNode = newId
        }

        if (lastTraceNode && lastTraceNode !== activeNode) {
          const exists = edges.find(ed => (ed[0] === lastTraceNode && ed[1] === activeNode) || (ed[1] === lastTraceNode && ed[0] === activeNode))
          if (!exists) {
            setEdges(prev => [...prev, [lastTraceNode, activeNode!]])
          }
        }
        setLastTraceNode(activeNode)
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

  const onPointerMove = (e: React.PointerEvent) => {
    const pt = screenToSVG(e)
    
    if (phase === "path-draw" && isDrawing && drawnPath) {
      if (checkCollision(pt.x, pt.y)) {
        if (drawnPath.length > 0) {
          const lastPt = drawnPath[drawnPath.length - 1]
          // Try sliding horizontally
          if (!checkCollision(pt.x, lastPt.y)) {
            setDrawnPath([...drawnPath, { x: pt.x, y: lastPt.y }])
            return
          }
          // Try sliding vertically
          if (!checkCollision(lastPt.x, pt.y)) {
            setDrawnPath([...drawnPath, { x: lastPt.x, y: pt.y }])
            return
          }
        }
        return // Stuck, ignore movement but don't cancel drawing
      }
      setDrawnPath([...drawnPath, pt])
      return
    }

    if (phase === "edit") {
      if (editLayer === "blocks" && dragZone) {
        setCollisionZones(prev => prev.map(z => {
          if (z.id === dragZone.id) {
            if (dragZone.type === 'move') {
              return { ...z, x: pt.x - z.width/2, y: pt.y - z.height/2 }
            } else if (dragZone.type === 'resize') {
              return { ...z, width: Math.max(20, pt.x - z.x), height: Math.max(20, pt.y - z.y) }
            }
          }
          return z
        }))
        return
      }
      if (editTool === "trace" && lastTraceNode) {
        setTraceCursor(pt)
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

  const onPointerUp = (e: React.PointerEvent) => {
    if (phase === "path-draw" && isDrawing) {
      setIsDrawing(false)
      const assemblyNode = nodes["ASSEMBLY"]
      if (assemblyNode && drawnPath && drawnPath.length > 0) {
        const pt = screenToSVG(e)
        // Check if released near assembly area
        if (ptDist(pt, assemblyNode) < 120) {
          if (onPathComplete) onPathComplete(drawnPath)
        }
      }
      return
    }
    setIsDrawing(false)
    if (phase === "edit") {
      if (editLayer === "blocks") {
        setDragZone(null)
      }
      if (dragNode) {
        if (editTool === "drag") {
          const pt = screenToSVG(e)
          const targetNode = getNodeAtPoint(pt)
          if (targetNode === dragNode) {
            setEditingNode(targetNode)
            setNodeIdInput(targetNode)
            const n = nodes[targetNode]
            if (n.room) setNodeType("room")
            else if (n.gate) setNodeType("gate")
            else if (n.target) setNodeType("assembly")
            else setNodeType("corridor")
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

  const handleToolbarPointerDown = (e: React.PointerEvent) => {
    toolbarDragRef.current = {
      isDragging: true,
      startX: e.clientX - toolbarPos.x,
      startY: e.clientY - toolbarPos.y
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const handleToolbarPointerMove = (e: React.PointerEvent) => {
    if (toolbarDragRef.current.isDragging) {
      setToolbarPos({
        x: e.clientX - toolbarDragRef.current.startX,
        y: e.clientY - toolbarDragRef.current.startY
      })
    }
  }
  const handleToolbarPointerUp = (e: React.PointerEvent) => {
    toolbarDragRef.current.isDragging = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <div 
      className="relative max-h-[68vh] max-w-[1000px] aspect-[1000/600] w-auto mx-auto rounded-xl overflow-hidden shadow-2xl bg-[#0a0a16] border border-gray-800 select-none"
      onContextMenu={(e) => {
        if (phase === "edit" && editTool === "trace") {
          e.preventDefault()
          setLastTraceNode(null)
          setTraceCursor(null)
        }
      }}
    >
      <img src="/map/cmr-emergency-plan-main.png" alt="Map" className="w-full h-full object-fill block pointer-events-none" />
      
      <svg
        ref={svgRef}
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full z-10 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Glow Filters */}
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trace cursor line (Edit Mode) */}
        {phase === "edit" && editTool === "trace" && lastTraceNode && traceCursor && (
          <line 
            x1={nodes[lastTraceNode].x} 
            y1={nodes[lastTraceNode].y} 
            x2={traceCursor.x} 
            y2={traceCursor.y} 
            stroke="white" 
            strokeWidth="3" 
            strokeDasharray="6 6"
            className="pointer-events-none"
          />
        )}

        {/* Render Graph Edges (Edit Mode Only) */}
        {phase === "edit" && edges.map(([a, b], i) => {
          if (!nodes[a] || !nodes[b]) return null
          const isHazardEdge = nodes[a].room || nodes[b].room
          if (editLayer === "path" && isHazardEdge) return null 
          
          let edgeOpacity = 0.4
          if (editLayer === "hazard" && !isHazardEdge) edgeOpacity = 0.1 

          return <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={`rgba(255,255,255,${edgeOpacity})`} strokeWidth="3" />
        })}

        {/* Render Collision Zones */}
        {phase === "edit" && collisionZones.map(zone => (
          <g key={zone.id}>
            <rect 
              x={zone.x} y={zone.y} width={zone.width} height={zone.height} 
              fill={editLayer === "blocks" ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.1)"} 
              stroke={editLayer === "blocks" ? "#ef4444" : "none"}
              strokeWidth="2"
              className={editLayer === "blocks" ? (editTool === "drag" ? "cursor-move" : "pointer-events-auto") : "pointer-events-none"}
            />
            {editLayer === "blocks" && (
              <rect
                x={zone.x + zone.width - 15} y={zone.y + zone.height - 15} width={15} height={15}
                fill="#ef4444"
                className={editTool === "drag" ? "cursor-se-resize" : "pointer-events-none"}
              />
            )}
          </g>
        ))}

        {/* Render Traced Neon Evacuation Path (Gameplay mode) */}
        {phase === "path-draw" && drawnPath && drawnPath.length > 0 && (
          <g>
            <path
              d={drawnPath.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
              fill="none"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neon-glow)"
              className="pointer-events-none"
            />
            <path
              d={drawnPath.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none animate-[pulse_1.5s_infinite]"
            />
          </g>
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
              <g key={k} className={editTool === "drag" ? "cursor-move" : "cursor-pointer"} opacity={opacity}>
                <circle cx={n.x} cy={n.y} r={isSelected ? "14" : "10"} fill={fillColor} stroke="white" strokeWidth="2" />
                {isSelected && <circle cx={n.x} cy={n.y} r="18" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_4s_linear_infinite]" />}
                <text 
                  x={n.x} y={n.y - 18} 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="16" 
                  fontWeight="bold" 
                  className="pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                  stroke="black"
                  strokeWidth="3"
                  paintOrder="stroke fill"
                >
                  {k}
                </text>
              </g>
            )
          }

          // Gameplay Rendering
          if (n.target) {
            const isTargetDest = phase === "path-draw"
            return (
              <g key={k} className="cursor-pointer">
                {isTargetDest && (
                  <circle 
                    cx={n.x} 
                    cy={n.y} 
                    r="45" 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth="2" 
                    className="animate-ping" 
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                )}
                <circle cx={n.x} cy={n.y} r="32" fill="rgba(251,191,36,0.15)" />
                <circle cx={n.x} cy={n.y} r="20" stroke="#fbbf24" strokeWidth="2" fill="none" />
                <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="20" className="pointer-events-none">⭐</text>
              </g>
            )
          }

          if (n.gate) {
            const isBlinkingExit = phase === "exit-select" && ["G1", "G2", "G3"].includes(k)
            return (
              <g key={k} className="cursor-pointer">
                {isBlinkingExit && (
                  <circle 
                    cx={n.x} 
                    cy={n.y} 
                    r="36" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    className="animate-ping" 
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                )}
                <circle cx={n.x} cy={n.y} r="24" fill={isBlinkingExit ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.15)"} />
                <circle cx={n.x} cy={n.y} r="15" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" className="pointer-events-none">🚪</text>
              </g>
            )
          }
          return null
        })}

        {/* SVG-based Fire indicator */}
        {hazardNode && nodes[hazardNode] && (phase === "hazard-confirm" || phase === "exit-select" || phase === "path-draw" || phase === "evaluated") && (
          <g className={phase === "hazard-confirm" ? "cursor-pointer" : "pointer-events-none"}>
            {/* Outer red warning pulse */}
            <circle 
              cx={nodes[hazardNode].x} 
              cy={nodes[hazardNode].y} 
              r="40" 
              fill="rgba(239, 68, 68, 0.25)" 
              stroke="#ef4444"
              strokeWidth="2"
              className={phase === "hazard-confirm" ? "animate-ping" : "animate-pulse"}
              style={{ transformOrigin: `${nodes[hazardNode].x}px ${nodes[hazardNode].y}px` }}
            />
            <circle 
              cx={nodes[hazardNode].x} 
              cy={nodes[hazardNode].y} 
              r="22" 
              fill="rgba(239, 68, 68, 0.4)" 
            />
            {/* Canvas fire effect inside SVG using foreignObject (larger size to prevent particles going outside canvas bounds) */}
            <foreignObject 
              x={nodes[hazardNode].x - 40} 
              y={nodes[hazardNode].y - 65} 
              width="80" 
              height="80"
            >
              <FireEffect size={80} />
            </foreignObject>
          </g>
        )}



      </svg>

      {/* Edit Mode Toolbar - Draggable */}
      {phase === "edit" && (
        <div 
          className="absolute z-30 bg-black/90 rounded-lg border border-gray-700 shadow-2xl flex flex-col overflow-hidden w-80"
          style={{ top: toolbarPos.y, left: toolbarPos.x }}
        >
          <div 
            className="bg-gray-800 text-gray-400 text-xs px-2 py-1 cursor-grab active:cursor-grabbing text-center font-bold flex justify-between items-center"
            onPointerDown={handleToolbarPointerDown}
            onPointerMove={handleToolbarPointerMove}
            onPointerUp={handleToolbarPointerUp}
          >
            <span>≡ Edit Mode ≡</span>
          </div>
          
          <div className="p-2 flex flex-col gap-2">
            <div className="flex bg-gray-800 rounded p-1">
              <button 
                onClick={() => setEditLayer("path")} 
                className={`flex-1 px-3 py-1 text-xs font-bold rounded ${editLayer === "path" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
              >
                🛣 Paths
              </button>
              <button 
                onClick={() => setEditLayer("hazard")} 
                className={`flex-1 px-3 py-1 text-xs font-bold rounded ${editLayer === "hazard" ? "bg-red-600 text-white" : "text-gray-400"}`}
              >
                🔥 Hazards
              </button>
              <button 
                onClick={() => setEditLayer("blocks")} 
                className={`flex-1 px-3 py-1 text-xs font-bold rounded ${editLayer === "blocks" ? "bg-orange-600 text-white" : "text-gray-400"}`}
              >
                🧱 Blocks
              </button>
            </div>
            
            <div className="w-full h-px bg-gray-700" />
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setEditTool("drag")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editTool === "drag" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                🖐 Drag
              </button>
              <button onClick={() => setEditTool("trace")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editTool === "trace" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                🛣️ Trace
              </button>
              <button onClick={() => setEditTool("add")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editTool === "add" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                + Add
              </button>
              <button onClick={() => setEditTool("connect")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editTool === "connect" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                🔗 Connect
              </button>
              <button onClick={() => setEditTool("delete")} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editTool === "delete" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                🗑 Del
              </button>
            </div>
            
            {editTool === "trace" && (
              <p className="text-center text-xs text-gray-400 italic">Right-click to finish tracing.</p>
            )}

            <div className="w-full h-px bg-gray-700" />
            <button onClick={handleExport} className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold text-white transition-colors">
              📋 Copy Map Code
            </button>
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
