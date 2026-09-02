import React from "react"
import { useTranslation } from "react-i18next"
import { PLANT_LAYOUT_CONFIG, PLANT_MAP_THEME, type RoomZoneConfig, type ExitZoneConfig, type GateConfig } from "../../config/plantMapData"

interface DynamicPlantMapSVGProps {
  phase?: string
  hazardNode?: string | null
  selectedExit?: string
}

export const DynamicPlantMapSVG: React.FC<DynamicPlantMapSVGProps> = ({
  phase,
  hazardNode,
  selectedExit
}) => {
  const { t } = useTranslation()

  return (
    <g id="dynamic-plant-map-svg-base">
      {/* 1. Clean Light Architectural Floor Base */}
      <rect
        x="0"
        y="0"
        width={PLANT_LAYOUT_CONFIG.width}
        height={PLANT_LAYOUT_CONFIG.height}
        fill={PLANT_MAP_THEME.bg}
        stroke="#0F172A"
        strokeWidth="3"
      />

      {/* 2. Blueprint Grid */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`grid-svg-v-${i}`}
          x1={i * 50}
          y1={0}
          x2={i * 50}
          y2={600}
          stroke={PLANT_MAP_THEME.grid}
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`grid-svg-h-${i}`}
          x1={0}
          y1={i * 50}
          x2={1000}
          y2={i * 50}
          stroke={PLANT_MAP_THEME.grid}
          strokeWidth="1"
        />
      ))}

      {/* 3. Evacuation Corridors */}
      <g id="svg-corridors-network">
        {PLANT_LAYOUT_CONFIG.corridors.map((c, idx) => (
          <polyline
            key={`corridor-svg-${idx}`}
            points={c.points.reduce((acc, val, i) => (i % 2 === 0 ? `${acc} ${val},` : `${acc}${val}`), "")}
            fill="none"
            stroke={PLANT_MAP_THEME.evacuationPath.stroke}
            strokeWidth={PLANT_MAP_THEME.evacuationPath.width}
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Directional Chevrons */}
        <text x="350" y="24" fontSize="11" fill="#047857" opacity="0.7">▶</text>
        <text x="650" y="24" fontSize="11" fill="#047857" opacity="0.7">▶</text>
        <text x="850" y="24" fontSize="11" fill="#047857" opacity="0.7">▶</text>

        <text x="948" y="120" fontSize="11" fill="#047857" opacity="0.7">▼</text>
        <text x="948" y="240" fontSize="11" fill="#047857" opacity="0.7">▼</text>
        <text x="948" y="350" fontSize="11" fill="#047857" opacity="0.7">▼</text>
        <text x="948" y="480" fontSize="11" fill="#047857" opacity="0.7">▼</text>

        <text x="850" y="572" fontSize="11" fill="#047857" opacity="0.7">◀</text>
        <text x="780" y="572" fontSize="11" fill="#047857" opacity="0.7">◀</text>
        <text x="450" y="572" fontSize="11" fill="#047857" opacity="0.7">▶</text>
        <text x="250" y="572" fontSize="11" fill="#047857" opacity="0.7">▶</text>

        <text x="54" y="150" fontSize="11" fill="#047857" opacity="0.7">▼</text>
        <text x="54" y="340" fontSize="11" fill="#047857" opacity="0.7">▼</text>
        <text x="54" y="480" fontSize="11" fill="#047857" opacity="0.7">▼</text>
      </g>

      {/* 4. Outer Boundary */}
      <rect
        x="12"
        y="12"
        width={PLANT_LAYOUT_CONFIG.width - 24}
        height={PLANT_LAYOUT_CONFIG.height - 24}
        fill="none"
        stroke="#0F172A"
        strokeWidth="2"
      />

      {/* 5. Main Department Rooms */}
      {PLANT_LAYOUT_CONFIG.rooms.map((room: RoomZoneConfig) => {
        const isHazardActive = Boolean(
          hazardNode && (
            room.hazardId === hazardNode ||
            (room.id === "bag-house-top" && (hazardNode === "BH-0" || hazardNode === "BH-1"))
          )
        )
        const shouldHighlightHazard = isHazardActive && (phase === "tutorial" || phase === "hazard-confirm" || phase === "exit-select" || phase === "path-draw" || phase === "evaluated")
        const translatedLabel = room.i18nKey ? t(room.i18nKey, room.label) : room.label

        return (
          <g key={`svg-room-${room.id}`}>
            {shouldHighlightHazard && (
              <rect
                x={room.x - 5}
                y={room.y - 5}
                width={room.width + 10}
                height={room.height + 10}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#EF4444"
                strokeWidth="3"
                rx="4"
              />
            )}
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={shouldHighlightHazard ? "#FEF2F2" : room.fill}
              stroke={shouldHighlightHazard ? "#EF4444" : (room.stroke || "#0F172A")}
              strokeWidth={shouldHighlightHazard ? 2.5 : (room.strokeWidth || 1.5)}
              rx="1"
            />
            {translatedLabel.split("\n").map((line: string, lIdx: number, allLines: string[]) => (
              <text
                key={`svg-txt-${room.id}-${lIdx}`}
                x={room.x + room.width / 2}
                y={room.y + (room.height / 2) - ((allLines.length - 1) * ((room.fontSize || 14) + 2) / 2) + (lIdx * ((room.fontSize || 14) + 2))}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={room.fontSize || 14}
                fontWeight="bold"
                fill={shouldHighlightHazard ? "#991B1B" : (room.textColor || "#0F172A")}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* 6. Sub Rooms (including Stairs) */}
      {PLANT_LAYOUT_CONFIG.subRooms.map((sub) => {
        const translatedSubLabel = sub.i18nKey ? t(sub.i18nKey, sub.label) : sub.label
        if (sub.isStairs) {
          return (
            <g key={`svg-sub-${sub.id}`}>
              <rect
                x={sub.x}
                y={sub.y}
                width={sub.width}
                height={sub.height}
                fill="#065F46"
                stroke="#0F172A"
                strokeWidth="1"
                rx="1"
              />
              <text
                x={sub.x + sub.width / 2}
                y={sub.y + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
              >
                🪜
              </text>
              <text
                x={sub.x + sub.width / 2}
                y={sub.y + sub.height - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="4.5"
                fontWeight="bold"
                fill="#FFFFFF"
              >
                STAIRS
              </text>
            </g>
          )
        }
        return (
          <g key={`svg-sub-${sub.id}`}>
            <rect
              x={sub.x}
              y={sub.y}
              width={sub.width}
              height={sub.height}
              fill={sub.fill}
              stroke="#0F172A"
              strokeWidth="1"
              rx="0.5"
            />
            {translatedSubLabel.split("\n").map((line: string, lIdx: number, allLines: string[]) => (
              <text
                key={`svg-sub-txt-${sub.id}-${lIdx}`}
                x={sub.x + sub.width / 2}
                y={sub.y + (sub.height / 2) - ((allLines.length - 1) * ((sub.fontSize || 6) + 1) / 2) + (lIdx * ((sub.fontSize || 6) + 1))}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={sub.fontSize || 6}
                fontWeight="bold"
                fill={sub.textColor || "#0F172A"}
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* 7. Gates */}
      {PLANT_LAYOUT_CONFIG.gates.map((gate: GateConfig) => {
        const translatedGateLabel = gate.i18nKey ? t(gate.i18nKey, gate.label) : gate.label
        return (
          <g key={`svg-gate-${gate.id}`}>
            <rect
              x={gate.x}
              y={gate.y}
              width={gate.width}
              height={gate.height}
              fill={gate.fill}
              stroke="#0F172A"
              strokeWidth="1.5"
              rx="2"
            />
            {translatedGateLabel.split("\n").map((line: string, lIdx: number, allLines: string[]) => (
              <text
                key={`svg-gate-txt-${gate.id}-${lIdx}`}
                x={gate.x + gate.width / 2}
                y={gate.y + (gate.height / 2) - ((allLines.length - 1) * 11 / 2) + (lIdx * 11)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="bold"
                fill={gate.textColor}
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* 8. Emergency Assembly Area */}
      <g id="svg-assembly-area">
        <circle
          cx={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          cy={PLANT_LAYOUT_CONFIG.assemblyArea.y + PLANT_LAYOUT_CONFIG.assemblyArea.height / 2}
          r="32"
          fill="rgba(4, 120, 87, 0.12)"
          stroke="#047857"
          strokeWidth="1"
          strokeDasharray="4,3"
        />
        <rect
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y}
          width={PLANT_LAYOUT_CONFIG.assemblyArea.width}
          height={PLANT_LAYOUT_CONFIG.assemblyArea.height}
          fill="#065F46"
          stroke="#0F172A"
          strokeWidth="2"
          rx="4"
        />
        <text
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + 20}
          textAnchor="middle"
          fontSize="16"
        >
          👥
        </text>
        <text
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + 54}
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fill="#065F46"
        >
          {t(PLANT_LAYOUT_CONFIG.assemblyArea.i18nKey, PLANT_LAYOUT_CONFIG.assemblyArea.label)}
        </text>
      </g>

      {/* 9. Emergency Exit Badges */}
      {PLANT_LAYOUT_CONFIG.exits.map((exit: ExitZoneConfig) => {
        const isSelected = selectedExit === exit.id || selectedExit === exit.targetNode
        return (
          <g key={`svg-exit-${exit.id}`}>
            <rect
              x={exit.x}
              y={exit.y}
              width={exit.width}
              height={exit.height}
              fill={isSelected ? "#059669" : "#047857"}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              rx="3"
            />
            <text
              x={exit.x + exit.width / 2}
              y={exit.y + 20}
              textAnchor="middle"
              fontSize="14"
            >
              🏃
            </text>
            <text
              x={exit.x + exit.width / 2}
              y={exit.y + exit.height + 8}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="bold"
              fill="#047857"
            >
              {t(exit.i18nKey, exit.label)}
            </text>
          </g>
        )
      })}
    </g>
  )
}
