import React from "react"
import { Group, Rect, Line, Text, Circle, Path } from "react-konva"
import { useTranslation } from "react-i18next"
import { PLANT_LAYOUT_CONFIG, PLANT_MAP_THEME, type RoomZoneConfig, type ExitZoneConfig, type GateConfig } from "../../config/plantMapData"

interface DynamicPlantMapBaseProps {
  phase?: "idle" | "tutorial" | "hazard-confirm" | "exit-select" | "path-draw" | "evaluated" | "edit"
  hazardNode?: string | null
  selectedExit?: string
  isWizard?: boolean
  wizardSelectedExits?: string[]
}

// Crisp Running Man SVG Path data for Emergency Exit Badges
const RUNNING_MAN_PATH = "M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.9l1.8-.8z"

// Assembly Area People Icon Path
const ASSEMBLY_ICON_PATH = "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"

// Curated Room Gradient Presets for Architectural Depth
const ROOM_GRADIENT_PALETTES: Record<string, { top: string; bottom: string; border: string; text: string; code: string }> = {
  "cold-refining": {
    top: "#5EB5C9",
    bottom: "#3E8D9E",
    border: "#0F172A",
    text: "#0F172A",
    code: "CR"
  },
  "hot-refining": {
    top: "#F87171",
    bottom: "#DC2626",
    border: "#450A0A",
    text: "#FFFFFF",
    code: "HR"
  },
  "utility": {
    top: "#FBBF24",
    bottom: "#D97706",
    border: "#0F172A",
    text: "#0F172A",
    code: "UT"
  },
  "amenity": {
    top: "#67E8F9",
    bottom: "#0EA5E9",
    border: "#0F172A",
    text: "#0F172A",
    code: "AM"
  },
  "storage": {
    top: "#E2E8F0",
    bottom: "#CBD5E1",
    border: "#0F172A",
    text: "#0F172A",
    code: "ST"
  },
  "toilet": {
    top: "#D1FAE5",
    bottom: "#A7F3D0",
    border: "#0F172A",
    text: "#065F46",
    code: "WC"
  },
  "dispatch": {
    top: "#38BDF8",
    bottom: "#0284C7",
    border: "#0F172A",
    text: "#FFFFFF",
    code: "DO"
  },
  "hazard-special": {
    top: "#FEF08A",
    bottom: "#FACC15",
    border: "#0F172A",
    text: "#713F12",
    code: "PNG"
  }
}

export const DynamicPlantMapBase: React.FC<DynamicPlantMapBaseProps> = ({
  phase,
  hazardNode,
  selectedExit,
  isWizard,
  wizardSelectedExits = [],
}) => {
  const { t } = useTranslation()

  return (
    <Group id="dynamic-vector-map-root">
      {/* 1. Architectural Floor Base */}
      <Rect
        x={0}
        y={0}
        width={PLANT_LAYOUT_CONFIG.width}
        height={PLANT_LAYOUT_CONFIG.height}
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth={3}
      />

      {/* 2. Precision Blueprint Grid Lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`grid-v-${i}`}
          points={[i * 50, 0, i * 50, 600]}
          stroke="#E2E8F0"
          strokeWidth={0.8}
          listening={false}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <Line
          key={`grid-h-${i}`}
          points={[0, i * 50, 1000, i * 50]}
          stroke="#E2E8F0"
          strokeWidth={0.8}
          listening={false}
        />
      ))}

      {/* 3. Safety Evacuation Corridors & Directional Chevron Network */}
      <Group id="corridors-network">
        {/* Subtle Corridor Safety Walkway Underlay */}
        {PLANT_LAYOUT_CONFIG.corridors.map((c, idx) => (
          <Line
            key={`corridor-glow-${idx}`}
            points={c.points}
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth={12}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        ))}

        {/* Core Green Dotted Evacuation Lines */}
        {PLANT_LAYOUT_CONFIG.corridors.map((c, idx) => (
          <Line
            key={`corridor-path-${idx}`}
            points={c.points}
            stroke="#059669"
            strokeWidth={3}
            dash={[7, 4]}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        ))}

        {/* Directional Flow Chevron Markers */}
        {/* Top perimeter chevrons heading right */}
        <Text x={350} y={19} text="▶" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={650} y={19} text="▶" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={850} y={19} text="▶" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />

        {/* Right perimeter chevrons heading down */}
        <Text x={943} y={120} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={943} y={240} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={943} y={350} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={943} y={480} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />

        {/* Bottom perimeter chevrons converging toward Assembly Area */}
        <Text x={850} y={561} text="◀" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={780} y={561} text="◀" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={450} y={561} text="▶" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={250} y={561} text="▶" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />

        {/* Left perimeter chevrons heading down */}
        <Text x={54} y={150} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={54} y={340} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />
        <Text x={54} y={480} text="▼" fontSize={11} fill="#047857" fontStyle="bold" opacity={0.85} listening={false} />

        {/* Vertical Corridor Dropper Arrow above Storage Area */}
        <Text x={280} y={482} text="▼" fontSize={13} fill="#047857" fontStyle="bold" opacity={0.9} listening={false} />
      </Group>

      {/* 4. Plant Perimeter Boundary Wall */}
      <Rect
        x={12}
        y={12}
        width={PLANT_LAYOUT_CONFIG.width - 24}
        height={PLANT_LAYOUT_CONFIG.height - 24}
        fill="transparent"
        stroke="#0F172A"
        strokeWidth={2}
        listening={false}
      />
      <Rect
        x={15}
        y={15}
        width={PLANT_LAYOUT_CONFIG.width - 30}
        height={PLANT_LAYOUT_CONFIG.height - 30}
        fill="transparent"
        stroke="#CBD5E1"
        strokeWidth={0.75}
        dash={[8, 4]}
        listening={false}
      />

      {/* 5. Main Department Rooms */}
      <Group id="rooms-layer">
        {PLANT_LAYOUT_CONFIG.rooms.map((room: RoomZoneConfig) => {
          const isHazardActive = Boolean(
            hazardNode && (
              room.hazardId === hazardNode ||
              (room.id === "bag-house-top" && (hazardNode === "BH-0" || hazardNode === "BH-1"))
            )
          )
          const isPhaseWithHazard = phase === "tutorial" || phase === "hazard-confirm" || phase === "exit-select" || phase === "path-draw" || phase === "evaluated"
          const shouldHighlightHazard = isHazardActive && isPhaseWithHazard
          const translatedLabel = room.i18nKey ? t(room.i18nKey, room.label) : room.label

          let catKey: string = room.category || "cold-refining"
          if (room.id === "storage-area") catKey = "storage"
          if (room.id === "toilet-area") catKey = "toilet"
          if (room.id === "dispatch-office") catKey = "dispatch"

          const pal = ROOM_GRADIENT_PALETTES[catKey] || {
            top: room.fill || "#67E8F9",
            bottom: "#0EA5E9",
            border: room.stroke || "#0F172A",
            text: room.textColor || "#0F172A",
            code: "RM"
          }

          return (
            <Group key={room.id} id={`room-${room.id}`}>
              {/* Active Hazard Warning Glow Ring */}
              {shouldHighlightHazard && (
                <Rect
                  x={room.x - 6}
                  y={room.y - 6}
                  width={room.width + 12}
                  height={room.height + 12}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth={3}
                  cornerRadius={6}
                  shadowColor="#EF4444"
                  shadowBlur={16}
                  shadowOpacity={0.8}
                  listening={false}
                />
              )}

              {/* Room Drop Shadow Base */}
              <Rect
                x={room.x + 1.5}
                y={room.y + 1.5}
                width={room.width}
                height={room.height}
                fill="rgba(15, 23, 42, 0.08)"
                cornerRadius={2}
                listening={false}
              />

              {/* Room Body Box with Material Gradient */}
              <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: room.height }}
                fillLinearGradientColorStops={
                  shouldHighlightHazard
                    ? [0, "#FEF2F2", 1, "#FEE2E2"]
                    : [0, pal.top, 1, pal.bottom]
                }
                stroke={shouldHighlightHazard ? "#EF4444" : pal.border}
                strokeWidth={shouldHighlightHazard ? 2.5 : 1.8}
                cornerRadius={2}
                listening={false}
              />

              {/* Architectural Top-Bevel Light Highlight */}
              {!shouldHighlightHazard && (
                <Line
                  points={[room.x + 2, room.y + 1.5, room.x + room.width - 2, room.y + 1.5]}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth={1.2}
                  listening={false}
                />
              )}

              {/* Department Blueprint Tag in top-left corner */}
              {room.width > 50 && room.height > 35 && (
                <Text
                  x={room.x + 5}
                  y={room.y + 4}
                  text={pal.code}
                  fontSize={7.5}
                  fontFamily="'Roboto Mono', monospace, sans-serif"
                  fontStyle="bold"
                  fill={shouldHighlightHazard ? "#DC2626" : "rgba(15, 23, 42, 0.4)"}
                  listening={false}
                />
              )}

              {/* Room Department Title Label */}
              <Text
                x={room.x + 3}
                y={room.y + Math.max(0, (room.height - (translatedLabel.split("\n").length * ((room.fontSize || 14) + 3))) / 2)}
                width={room.width - 6}
                text={translatedLabel}
                align="center"
                verticalAlign="middle"
                fontSize={room.fontSize || 14}
                fontStyle="bold"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fill={shouldHighlightHazard ? "#991B1B" : pal.text}
                lineHeight={1.15}
                shadowColor={pal.text === "#FFFFFF" ? "rgba(0,0,0,0.35)" : "transparent"}
                shadowBlur={pal.text === "#FFFFFF" ? 2 : 0}
                listening={false}
              />
            </Group>
          )
        })}
      </Group>

      {/* 6. Sub Rooms (Offices, Security, Punch M/C, Meeting Rooms, QA Lab, Stairs) */}
      <Group id="subrooms-layer">
        {PLANT_LAYOUT_CONFIG.subRooms.map((sub) => {
          const translatedSubLabel = sub.i18nKey ? t(sub.i18nKey, sub.label) : sub.label
          if (sub.isStairs) {
            return (
              <Group key={sub.id} id={`subroom-${sub.id}`}>
                <Rect
                  x={sub.x}
                  y={sub.y}
                  width={sub.width}
                  height={sub.height}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{ x: 0, y: sub.height }}
                  fillLinearGradientColorStops={[0, "#047857", 1, "#064E3B"]}
                  stroke="#0F172A"
                  strokeWidth={1}
                  cornerRadius={1}
                  listening={false}
                />
                <Text
                  x={sub.x}
                  y={sub.y + 2}
                  width={sub.width}
                  text="🪜"
                  align="center"
                  fontSize={8}
                  listening={false}
                />
                <Text
                  x={sub.x}
                  y={sub.y + sub.height - 8}
                  width={sub.width}
                  text="STAIRS"
                  align="center"
                  fontSize={4.5}
                  fontStyle="bold"
                  fontFamily="system-ui, sans-serif"
                  fill="#FFFFFF"
                  listening={false}
                />
              </Group>
            )
          }
          return (
            <Group key={sub.id} id={`subroom-${sub.id}`}>
              <Rect
                x={sub.x}
                y={sub.y}
                width={sub.width}
                height={sub.height}
                fill={sub.fill}
                stroke="#0F172A"
                strokeWidth={1}
                cornerRadius={1}
                listening={false}
              />
              <Text
                x={sub.x + 1}
                y={sub.y + (sub.verticalText ? 4 : 2)}
                width={sub.width - 2}
                text={translatedSubLabel}
                align="center"
                fontSize={sub.fontSize || 6}
                fontStyle="bold"
                fontFamily="system-ui, sans-serif"
                fill={sub.textColor || "#0F172A"}
                lineHeight={1.1}
                listening={false}
              />
            </Group>
          )
        })}
      </Group>

      {/* 7. Plant Entry / Exit Gates (Gate 1, Gate 2, Gate 3) */}
      <Group id="gates-layer">
        {PLANT_LAYOUT_CONFIG.gates.map((gate: GateConfig) => {
          const translatedGateLabel = gate.i18nKey ? t(gate.i18nKey, gate.label) : gate.label
          return (
            <Group key={gate.id} id={gate.id}>
              {/* Gate Badge Shadow */}
              <Rect
                x={gate.x + 1}
                y={gate.y + 1}
                width={gate.width}
                height={gate.height}
                fill="rgba(0,0,0,0.25)"
                cornerRadius={3}
                listening={false}
              />
              {/* Gate Badge Body with Metallic Crimson Gradient */}
              <Rect
                x={gate.x}
                y={gate.y}
                width={gate.width}
                height={gate.height}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: gate.height }}
                fillLinearGradientColorStops={[0, "#991B1B", 1, "#581C87"]}
                stroke="#0F172A"
                strokeWidth={1.8}
                cornerRadius={3}
                listening={false}
              />
              <Text
                x={gate.x}
                y={gate.y + (gate.verticalText ? 4 : 8)}
                width={gate.width}
                text={translatedGateLabel}
                align="center"
                fontSize={10}
                fontStyle="bold"
                fontFamily="system-ui, -apple-system, sans-serif"
                fill="#FFFFFF"
                lineHeight={1.1}
                shadowColor="rgba(0,0,0,0.5)"
                shadowBlur={2}
                listening={false}
              />
            </Group>
          )
        })}
      </Group>

      {/* 8. Emergency Assembly Area Emblem (Concentric Muster Point) */}
      <Group id="assembly-area-emblem">
        {/* Outer Radiant Concentric Ring */}
        <Circle
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + PLANT_LAYOUT_CONFIG.assemblyArea.height / 2}
          r={34}
          fill="rgba(4, 120, 87, 0.08)"
          stroke="#059669"
          strokeWidth={1}
          dash={[4, 3]}
          listening={false}
        />

        {/* Inner Safety Ring */}
        <Circle
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + PLANT_LAYOUT_CONFIG.assemblyArea.height / 2}
          r={28}
          fill="rgba(4, 120, 87, 0.14)"
          stroke="#047857"
          strokeWidth={1.2}
          listening={false}
        />

        {/* Assembly Area Badge Box with Emerald Gradient */}
        <Rect
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y}
          width={PLANT_LAYOUT_CONFIG.assemblyArea.width}
          height={PLANT_LAYOUT_CONFIG.assemblyArea.height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: PLANT_LAYOUT_CONFIG.assemblyArea.height }}
          fillLinearGradientColorStops={[0, "#059669", 1, "#064E3B"]}
          stroke="#0F172A"
          strokeWidth={2}
          cornerRadius={4}
          shadowColor="#059669"
          shadowBlur={8}
          shadowOpacity={0.5}
          listening={false}
        />

        {/* Gathering People Muster Icon */}
        <Path
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + 15}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + 4}
          data={ASSEMBLY_ICON_PATH}
          fill="#A7F3D0"
          scaleX={1}
          scaleY={1}
          listening={false}
        />

        {/* Translated Label */}
        <Text
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x - 20}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + 52}
          width={PLANT_LAYOUT_CONFIG.assemblyArea.width + 40}
          text={t(PLANT_LAYOUT_CONFIG.assemblyArea.i18nKey, PLANT_LAYOUT_CONFIG.assemblyArea.label)}
          align="center"
          fontSize={7}
          fontStyle="bold"
          fontFamily="system-ui, sans-serif"
          fill="#065F46"
          listening={false}
        />
      </Group>

      {/* 9. Photoluminescent Emergency Exit Signs */}
      <Group id="emergency-exits-layer">
        {PLANT_LAYOUT_CONFIG.exits.map((exit: ExitZoneConfig) => {
          const isSelected = selectedExit === exit.id || selectedExit === exit.targetNode
          const isWizardSelected = isWizard && wizardSelectedExits.includes(exit.id)
          const isExitSelectPhase = phase === "exit-select"
          const translatedExitLabel = t(exit.i18nKey, exit.label)

          return (
            <Group key={exit.id} id={`exit-badge-${exit.id}`}>
              {/* Pulsing Beacon Glow during exit selection */}
              {isExitSelectPhase && !isWizardSelected && (
                <Rect
                  x={exit.x - 4}
                  y={exit.y - 4}
                  width={exit.width + 8}
                  height={exit.height + 8}
                  fill="rgba(5, 150, 105, 0.3)"
                  stroke="#059669"
                  strokeWidth={2}
                  cornerRadius={6}
                  shadowColor="#10B981"
                  shadowBlur={12}
                  shadowOpacity={0.8}
                  listening={false}
                />
              )}

              {/* Photoluminescent Safety Green Badge with Gradient */}
              <Rect
                x={exit.x}
                y={exit.y}
                width={exit.width}
                height={exit.height}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: exit.height }}
                fillLinearGradientColorStops={
                  isSelected || isWizardSelected
                    ? [0, "#10B981", 1, "#047857"]
                    : [0, "#059669", 1, "#065F46"]
                }
                stroke="#FFFFFF"
                strokeWidth={1.5}
                cornerRadius={4}
                shadowColor="rgba(0,0,0,0.35)"
                shadowBlur={4}
                shadowOffsetX={1}
                shadowOffsetY={1}
                listening={false}
              />

              {/* Running Man Vector Glyph */}
              <Path
                x={exit.x + (exit.width - 24) / 2}
                y={exit.y + 4}
                data={RUNNING_MAN_PATH}
                fill="#FFFFFF"
                scaleX={1}
                scaleY={1}
                listening={false}
              />

              {/* EMERGENCY EXIT Caption */}
              <Text
                x={exit.x - 10}
                y={exit.y + exit.height + 2}
                width={exit.width + 20}
                text={translatedExitLabel}
                align="center"
                fontSize={6.5}
                fontStyle="bold"
                fontFamily="system-ui, sans-serif"
                fill="#047857"
                listening={false}
              />
            </Group>
          )
        })}
      </Group>
    </Group>
  )
}

