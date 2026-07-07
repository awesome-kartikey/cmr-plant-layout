import type { Department, ExitPoint } from "../../types"

export const DEPARTMENTS: Department[] = [
  { id: "blast-furnace", label: "Blast Furnace", x: 140, y: 140, w: 300, h: 200, fill: "#dbeafe", stroke: "#3b82f6" },
  { id: "steelmaking", label: "Steelmaking (BOF)", x: 140, y: 460, w: 300, h: 200, fill: "#fef3c7", stroke: "#f59e0b" },
  { id: "rolling-mill", label: "Rolling Mill", x: 740, y: 140, w: 300, h: 200, fill: "#e0f2fe", stroke: "#0284c7" },
  { id: "maintenance", label: "Maintenance & Utilities", x: 740, y: 460, w: 300, h: 200, fill: "#dcfce7", stroke: "#22c55e" },
  { id: "power-plant", label: "Power Plant", x: 460, y: 300, w: 260, h: 200, fill: "#fee2e2", stroke: "#ef4444" },
]

export const EXITS: ExitPoint[] = [
  { id: "west", label: "West Exit", x: 60, y: 385 },
  { id: "east", label: "East Exit", x: 1120, y: 385 },
  { id: "south", label: "South Exit", x: 600, y: 725 },
]

export const NEAREST_EXIT: Record<string, string> = {
  "blast-furnace": "west",
  "steelmaking": "south",
  "rolling-mill": "east",
  "maintenance": "south",
  "power-plant": "south",
}

export const ASSEMBLY_AREA = { x: 600, y: 50, w: 160, h: 40 }

interface PlantMapProps {
  width?: number
  height?: number
  hazardId?: string | null
  showExits?: boolean
  children?: React.ReactNode
}

export function PlantMap({ width = 1200, height = 800, hazardId, showExits = false, children }: PlantMapProps) {
  const hazardDept = DEPARTMENTS.find((d) => d.id === hazardId)

  return (
    <svg viewBox="0 0 1200 800" width={width} height={height} className="bg-white rounded-lg border">
      <rect x="20" y="20" width="1160" height="760" fill="#f9fafb" stroke="#9ca3af" strokeWidth="3" rx="12" />

      {DEPARTMENTS.map((dept) => (
        <g key={dept.id}>
          <rect x={dept.x} y={dept.y} width={dept.w} height={dept.h}
            fill={dept.fill} stroke={dept.stroke} strokeWidth="3" rx="10" />
          <text x={dept.x + dept.w / 2} y={dept.y + dept.h / 2 + 6}
            textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
            {dept.label}
          </text>
        </g>
      ))}

      <rect x={ASSEMBLY_AREA.x} y={ASSEMBLY_AREA.y} width={ASSEMBLY_AREA.w} height={ASSEMBLY_AREA.h}
        fill="#bbf7d0" stroke="#16a34a" strokeWidth="3" rx="8" />
      <text x={ASSEMBLY_AREA.x + ASSEMBLY_AREA.w / 2} y={ASSEMBLY_AREA.y + ASSEMBLY_AREA.h / 2 + 5}
        textAnchor="middle" fontSize="14" fontWeight="600" fill="#166534">
        🏁 ASSEMBLY
      </text>

      {showExits &&
        EXITS.map((exit) => (
          <g key={exit.id}>
            <rect x={exit.x} y={exit.y} width="20" height="28" fill="white" stroke="#16a34a" strokeWidth="3" rx="3" />
            <circle cx={exit.x + 10} cy={exit.y + 14} r="3" fill="#16a34a" />
            <text x={exit.x + 10} y={exit.y - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">
              {exit.label}
            </text>
          </g>
        ))}

      {hazardDept && (
        <rect x={hazardDept.x} y={hazardDept.y} width={hazardDept.w} height={hazardDept.h}
          fill="rgba(255,0,0,0.25)" stroke="red" strokeWidth="3" rx="10" strokeDasharray="8 4" />
      )}

      <path d="M460,235 L740,235" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" fill="none" />
      <path d="M460,555 L740,555" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" fill="none" />
      <path d="M285,330 L285,460" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" fill="none" />
      <path d="M905,330 L905,460" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" fill="none" />
      <path d="M600,720 L600,700" stroke="#6b7280" strokeWidth="4" strokeDasharray="10 8" fill="none" />

      {children}
    </svg>
  )
}
