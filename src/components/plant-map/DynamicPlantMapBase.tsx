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
      {/* 1. Clean Light Architectural Floor Base */}
      <Rect
        x={0}
        y={0}
        width={PLANT_LAYOUT_CONFIG.width}
        height={PLANT_LAYOUT_CONFIG.height}
        fill={PLANT_MAP_THEME.bg}
        stroke="#0F172A"
        strokeWidth={3}
      />

      {/* 2. Architectural Blueprint Grid Lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`grid-v-${i}`}
          points={[i * 50, 0, i * 50, 600]}
          stroke={PLANT_MAP_THEME.grid}
          strokeWidth={1}
          listening={false}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <Line
          key={`grid-h-${i}`}
          points={[0, i * 50, 1000, i * 50]}
          stroke={PLANT_MAP_THEME.grid}
          strokeWidth={1}
          listening={false}
        />
      ))}

      {/* 3. Evacuation Corridors & Pathways (Dotted Green Safety Lines with Clean Connectors) */}
      <Group id="corridors-network">
        {PLANT_LAYOUT_CONFIG.corridors.map((c, idx) => (
          <Line
            key={`corridor-path-${idx}`}
            points={c.points}
            stroke={PLANT_MAP_THEME.evacuationPath.stroke}
            strokeWidth={PLANT_MAP_THEME.evacuationPath.width}
            dash={[6, 4]}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        ))}

        {/* Directional Flow Chevron Markers along the perimeter */}
        {/* Top corridor rightward arrows */}
        <Text x={350} y={20} text="▶" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={650} y={20} text="▶" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={850} y={20} text="▶" fontSize={11} fill="#047857" opacity={0.7} listening={false} />

        {/* Right corridor downward arrows */}
        <Text x={948} y={120} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={948} y={240} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={948} y={350} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={948} y={480} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />

        {/* Bottom corridor leftward arrows heading toward Assembly Area */}
        <Text x={850} y={562} text="◀" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={780} y={562} text="◀" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={450} y={562} text="▶" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={250} y={562} text="▶" fontSize={11} fill="#047857" opacity={0.7} listening={false} />

        {/* Left corridor downward arrows */}
        <Text x={54} y={150} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={54} y={340} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
        <Text x={54} y={480} text="▼" fontSize={11} fill="#047857" opacity={0.7} listening={false} />
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

          return (
            <Group key={room.id} id={`room-${room.id}`}>
              {/* Active Hazard Ambient Warning Glow */}
              {shouldHighlightHazard && (
                <Rect
                  x={room.x - 5}
                  y={room.y - 5}
                  width={room.width + 10}
                  height={room.height + 10}
                  fill="rgba(239, 68, 68, 0.2)"
                  stroke="#EF4444"
                  strokeWidth={3}
                  cornerRadius={4}
                  shadowColor="#EF4444"
                  shadowBlur={14}
                  shadowOpacity={0.7}
                  listening={false}
                />
              )}

              {/* Room Body Box */}
              <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={shouldHighlightHazard ? "#FEF2F2" : room.fill}
                stroke={shouldHighlightHazard ? "#EF4444" : (room.stroke || "#0F172A")}
                strokeWidth={shouldHighlightHazard ? 2.5 : (room.strokeWidth || 1.5)}
                cornerRadius={1}
                shadowColor="rgba(0,0,0,0.15)"
                shadowBlur={2}
                shadowOffsetX={1}
                shadowOffsetY={1}
                listening={false}
              />

              {/* Room Text Label */}
              <Text
                x={room.x + 2}
                y={room.y + Math.max(0, (room.height - (translatedLabel.split("\n").length * ((room.fontSize || 14) + 3))) / 2)}
                width={room.width - 4}
                text={translatedLabel}
                align="center"
                verticalAlign="middle"
                fontSize={room.fontSize || 14}
                fontStyle="bold"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fill={shouldHighlightHazard ? "#991B1B" : (room.textColor || "#0F172A")}
                lineHeight={1.15}
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
                  fill="#065F46"
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
                cornerRadius={0.5}
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
              <Rect
                x={gate.x}
                y={gate.y}
                width={gate.width}
                height={gate.height}
                fill={gate.fill}
                stroke="#0F172A"
                strokeWidth={1.5}
                cornerRadius={2}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={3}
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
                fontFamily="system-ui, sans-serif"
                fill={gate.textColor}
                lineHeight={1.1}
                listening={false}
              />
            </Group>
          )
        })}
      </Group>

      {/* 8. Emergency Assembly Area Emblem */}
      <Group id="assembly-area-emblem">
        {/* Radar Pulse Background */}
        <Circle
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x + PLANT_LAYOUT_CONFIG.assemblyArea.width / 2}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y + PLANT_LAYOUT_CONFIG.assemblyArea.height / 2}
          r={32}
          fill="rgba(4, 120, 87, 0.12)"
          stroke="#047857"
          strokeWidth={1}
          dash={[4, 3]}
          listening={false}
        />

        {/* Assembly Area Box */}
        <Rect
          x={PLANT_LAYOUT_CONFIG.assemblyArea.x}
          y={PLANT_LAYOUT_CONFIG.assemblyArea.y}
          width={PLANT_LAYOUT_CONFIG.assemblyArea.width}
          height={PLANT_LAYOUT_CONFIG.assemblyArea.height}
          fill="#065F46"
          stroke="#0F172A"
          strokeWidth={2}
          cornerRadius={4}
          shadowColor="#047857"
          shadowBlur={6}
          shadowOpacity={0.4}
          listening={false}
        />

        {/* Gathering People Icon */}
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

      {/* 9. Emergency Exit Badges */}
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
                  fill="rgba(4, 120, 87, 0.25)"
                  stroke="#047857"
                  strokeWidth={2}
                  cornerRadius={6}
                  shadowColor="#047857"
                  shadowBlur={10}
                  shadowOpacity={0.6}
                  listening={false}
                />
              )}

              {/* Main Green Exit Badge */}
              <Rect
                x={exit.x}
                y={exit.y}
                width={exit.width}
                height={exit.height}
                fill={isSelected || isWizardSelected ? "#059669" : "#047857"}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                cornerRadius={3}
                shadowColor="rgba(0,0,0,0.3)"
                shadowBlur={3}
                shadowOffsetX={1}
                shadowOffsetY={1}
                listening={false}
              />

              {/* Running Man Glyph */}
              <Path
                x={exit.x + (exit.width - 24) / 2}
                y={exit.y + 4}
                data={RUNNING_MAN_PATH}
                fill="#FFFFFF"
                scaleX={1}
                scaleY={1}
                listening={false}
              />

              {/* EMERGENCY EXIT Label */}
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
