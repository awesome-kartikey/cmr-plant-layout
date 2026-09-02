export interface RoomZoneConfig {
  id: string
  label: string
  i18nKey: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke?: string
  strokeWidth?: number
  textColor?: string
  fontSize?: number
  hazardId?: string
  category: "cold-refining" | "hot-refining" | "utility" | "office" | "service" | "hazard-special"
}

export interface SubRoomConfig {
  id: string
  label: string
  i18nKey: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  fontSize?: number
  textColor?: string
  verticalText?: boolean
  isStairs?: boolean
}

export interface ExitZoneConfig {
  id: string
  targetNode: string
  label: string
  i18nKey: string
  x: number
  y: number
  width: number
  height: number
  arrowDirection?: "up" | "down" | "left" | "right"
}

export interface GateConfig {
  id: string
  label: string
  i18nKey: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  textColor: string
  verticalText?: boolean
}

export interface AssemblyAreaConfig {
  id: string
  label: string
  i18nKey: string
  x: number
  y: number
  width: number
  height: number
}

export interface CorridorLineConfig {
  points: number[]
  dashed?: boolean
  strokeColor?: string
  strokeWidth?: number
  hasArrows?: boolean
}

export interface PlantLayoutConfig {
  width: number
  height: number
  rooms: RoomZoneConfig[]
  subRooms: SubRoomConfig[]
  exits: ExitZoneConfig[]
  gates: GateConfig[]
  assemblyArea: AssemblyAreaConfig
  corridors: CorridorLineConfig[]
}

// Clean Light Architectural CAD Theme
export const PLANT_MAP_THEME = {
  bg: "#F8FAFC",
  grid: "rgba(15, 23, 42, 0.04)",
  wallStroke: "#0F172A",
  outerBorder: "#0F172A",
  coldRefining: {
    fill: "#67B8C7",
    stroke: "#0F172A",
    text: "#FFFFFF",
    alertGlow: "rgba(103, 184, 199, 0.5)"
  },
  hotRefining: {
    fill: "#F87171",
    stroke: "#0F172A",
    text: "#FFFFFF",
    alertGlow: "rgba(248, 113, 113, 0.5)"
  },
  bagHouse: {
    fill: "#FACC15",
    stroke: "#0F172A",
    text: "#0F172A",
    alertGlow: "rgba(250, 204, 21, 0.5)"
  },
  dgArea: {
    fill: "#FDE047",
    stroke: "#0F172A",
    text: "#0F172A",
    alertGlow: "rgba(253, 224, 71, 0.5)"
  },
  adminOffice: {
    fill: "#38BDF8",
    stroke: "#0F172A",
    text: "#FFFFFF",
    alertGlow: "rgba(56, 189, 248, 0.5)"
  },
  serviceGreen: {
    fill: "#D1FAE5",
    stroke: "#0F172A",
    text: "#064E3B",
    alertGlow: "rgba(209, 250, 229, 0.5)"
  },
  gateCrimson: {
    fill: "#7F1D1D",
    stroke: "#0F172A",
    text: "#FFFFFF"
  },
  exitGreen: {
    fill: "#047857",
    border: "#FFFFFF",
    glow: "rgba(4, 120, 87, 0.6)"
  },
  hazardRed: {
    glow: "rgba(239, 68, 68, 0.8)",
    border: "#EF4444"
  },
  evacuationPath: {
    stroke: "#047857",
    width: 2.5
  }
}

export const PLANT_LAYOUT_CONFIG: PlantLayoutConfig = {
  width: 1000,
  height: 600,
  rooms: [
    // Top Row
    {
      id: "bag-house-top",
      label: "BAG HOUSE",
      i18nKey: "map.bagHouse",
      hazardId: "BH-0",
      x: 297,
      y: 50,
      width: 250,
      height: 43,
      fill: PLANT_MAP_THEME.bagHouse.fill,
      stroke: PLANT_MAP_THEME.bagHouse.stroke,
      textColor: PLANT_MAP_THEME.bagHouse.text,
      fontSize: 16,
      category: "utility"
    },
    {
      id: "mrm-mc",
      label: "MRM M/C",
      i18nKey: "map.mrmMc",
      hazardId: "MRM M/C",
      x: 610,
      y: 50,
      width: 115,
      height: 45,
      fill: PLANT_MAP_THEME.hotRefining.fill,
      stroke: PLANT_MAP_THEME.hotRefining.stroke,
      textColor: PLANT_MAP_THEME.hotRefining.text,
      fontSize: 15,
      category: "hot-refining"
    },
    {
      id: "idsm",
      label: "IDSM",
      i18nKey: "map.idsm",
      hazardId: "IDSM",
      x: 725,
      y: 50,
      width: 60,
      height: 45,
      fill: "#FCA5A5",
      stroke: "#0F172A",
      textColor: "#450A0A",
      fontSize: 10,
      category: "hot-refining"
    },
    {
      id: "dg-area",
      label: "DIESEL OIL\nEXT.\n\nDG AREA",
      i18nKey: "map.dgArea",
      hazardId: "DG",
      x: 795,
      y: 48,
      width: 68,
      height: 152,
      fill: PLANT_MAP_THEME.dgArea.fill,
      stroke: PLANT_MAP_THEME.dgArea.stroke,
      textColor: PLANT_MAP_THEME.dgArea.text,
      fontSize: 10,
      category: "utility"
    },
    {
      id: "png",
      label: "PNG",
      i18nKey: "map.png",
      hazardId: "PNG",
      x: 935,
      y: 150,
      width: 50,
      height: 70,
      fill: "#FEF08A",
      stroke: "#0F172A",
      textColor: "#713F12",
      fontSize: 13,
      category: "hazard-special"
    },

    // Left Column Cold Refining
    {
      id: "cra-top-left",
      label: "COLD\nREFINING\nAREA",
      i18nKey: "map.coldRefiningArea",
      hazardId: "CRA-4",
      x: 127,
      y: 68,
      width: 139,
      height: 206,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 16,
      category: "cold-refining"
    },
    {
      id: "cra-mid-left",
      label: "COLD\nREFINING\nAREA",
      i18nKey: "map.coldRefiningArea",
      hazardId: "CRA-3",
      x: 127,
      y: 313,
      width: 145,
      height: 96,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 15,
      category: "cold-refining"
    },
    {
      id: "cra-bot-left",
      label: "COLD\nREFINING\nAREA",
      i18nKey: "map.coldRefiningArea",
      hazardId: "CRA-2",
      x: 133,
      y: 436,
      width: 77,
      height: 110,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 11,
      category: "cold-refining"
    },

    // Center Section
    {
      id: "cra-center-top",
      label: "COLD\nREFINING\nAREA",
      i18nKey: "map.coldRefiningArea",
      hazardId: "CRA-5",
      x: 328,
      y: 165,
      width: 106,
      height: 110,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 13,
      category: "cold-refining"
    },
    {
      id: "hot-center-top",
      label: "HOT\nREFINING\nAREA",
      i18nKey: "map.hotRefiningArea",
      hazardId: "HOT-1",
      x: 457,
      y: 103,
      width: 105,
      height: 175,
      fill: PLANT_MAP_THEME.hotRefining.fill,
      stroke: PLANT_MAP_THEME.hotRefining.stroke,
      textColor: PLANT_MAP_THEME.hotRefining.text,
      fontSize: 14,
      category: "hot-refining"
    },
    {
      id: "cra-center-mid",
      label: "COLD\nREFINING\nAREA",
      i18nKey: "map.coldRefiningArea",
      hazardId: "CRA",
      x: 307,
      y: 311,
      width: 260,
      height: 100,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 18,
      category: "cold-refining"
    },
    {
      id: "cra-center-bot",
      label: "COLD REFINING AREA",
      i18nKey: "map.coldRefiningAreaSingle",
      hazardId: "CRA-6",
      x: 307,
      y: 436,
      width: 260,
      height: 44,
      fill: PLANT_MAP_THEME.coldRefining.fill,
      stroke: PLANT_MAP_THEME.coldRefining.stroke,
      textColor: PLANT_MAP_THEME.coldRefining.text,
      fontSize: 14,
      category: "cold-refining"
    },
    {
      id: "hot-tall-main",
      label: "HOT\nREFINING\nAREA",
      i18nKey: "map.hotRefiningArea",
      hazardId: "Hot-2",
      x: 604,
      y: 138,
      width: 150,
      height: 346,
      fill: PLANT_MAP_THEME.hotRefining.fill,
      stroke: PLANT_MAP_THEME.hotRefining.stroke,
      textColor: PLANT_MAP_THEME.hotRefining.text,
      fontSize: 22,
      category: "hot-refining"
    },

    // Right Column
    {
      id: "bag-house-right",
      label: "BAG\nHOUSE",
      i18nKey: "map.bagHouseRight",
      hazardId: "Bag-H",
      x: 795,
      y: 218,
      width: 68,
      height: 98,
      fill: PLANT_MAP_THEME.bagHouse.fill,
      stroke: PLANT_MAP_THEME.bagHouse.stroke,
      textColor: PLANT_MAP_THEME.bagHouse.text,
      fontSize: 13,
      category: "utility"
    },
    {
      id: "samvaad-hall",
      label: "SAMVAAD\nHALL",
      i18nKey: "map.samvaadHall",
      hazardId: "Samvad",
      x: 795,
      y: 356,
      width: 48,
      height: 68,
      fill: PLANT_MAP_THEME.adminOffice.fill,
      stroke: PLANT_MAP_THEME.adminOffice.stroke,
      textColor: "#FFFFFF",
      fontSize: 10,
      category: "office"
    },
    {
      id: "admin-block",
      label: "ADMIN\nBLOCK",
      i18nKey: "map.adminBlock",
      hazardId: "Admin-B",
      x: 795,
      y: 424,
      width: 48,
      height: 44,
      fill: PLANT_MAP_THEME.adminOffice.fill,
      stroke: PLANT_MAP_THEME.adminOffice.stroke,
      textColor: "#FFFFFF",
      fontSize: 10,
      category: "office"
    },
    {
      id: "store",
      label: "STORE",
      i18nKey: "map.store",
      hazardId: "Store",
      x: 795,
      y: 500,
      width: 94,
      height: 52,
      fill: PLANT_MAP_THEME.adminOffice.fill,
      stroke: PLANT_MAP_THEME.adminOffice.stroke,
      textColor: "#FFFFFF",
      fontSize: 13,
      category: "office"
    },

    // Bottom Row - Aligned flush directly under cra-center-bot from x: 216 to 566
    {
      id: "storage-area",
      label: "STORAGE\nAREA",
      i18nKey: "map.storageArea",
      hazardId: "SA",
      x: 216,
      y: 504,
      width: 110,
      height: 42,
      fill: PLANT_MAP_THEME.serviceGreen.fill,
      stroke: PLANT_MAP_THEME.serviceGreen.stroke,
      textColor: PLANT_MAP_THEME.serviceGreen.text,
      fontSize: 11,
      category: "service"
    },
    {
      id: "toilet-area",
      label: "TOILET\nAREA",
      i18nKey: "map.toiletArea",
      hazardId: "TA",
      x: 326,
      y: 504,
      width: 110,
      height: 42,
      fill: PLANT_MAP_THEME.serviceGreen.fill,
      stroke: PLANT_MAP_THEME.serviceGreen.stroke,
      textColor: PLANT_MAP_THEME.serviceGreen.text,
      fontSize: 11,
      category: "service"
    },
    {
      id: "dispatch-office",
      label: "DISPATCH\nOFFICE",
      i18nKey: "map.dispatchOffice",
      hazardId: "DO",
      x: 436,
      y: 504,
      width: 130,
      height: 42,
      fill: PLANT_MAP_THEME.adminOffice.fill,
      stroke: PLANT_MAP_THEME.adminOffice.stroke,
      textColor: "#FFFFFF",
      fontSize: 11,
      category: "office"
    }
  ],
  subRooms: [
    // Sub rooms next to DG area (Security column)
    {
      id: "stairs-top",
      label: "STAIRS",
      i18nKey: "map.stairs",
      x: 863,
      y: 48,
      width: 26,
      height: 20,
      fill: "#065F46",
      fontSize: 5,
      textColor: "#FFFFFF",
      isStairs: true
    },
    {
      id: "clock-room",
      label: "CLOCK\nROOM",
      i18nKey: "map.clockRoom",
      x: 863,
      y: 68,
      width: 26,
      height: 25,
      fill: "#7DD3FC",
      fontSize: 5.5,
      textColor: "#0C4A6E"
    },
    {
      id: "security-office",
      label: "SECURITY\nOFFICE",
      i18nKey: "map.securityOffice",
      x: 863,
      y: 93,
      width: 26,
      height: 35,
      fill: "#7DD3FC",
      fontSize: 5,
      textColor: "#0C4A6E"
    },
    {
      id: "punch-mc",
      label: "SECURITY CHECK POINT\nAND PUNCH M/C IN/OUT",
      i18nKey: "map.punchMc",
      x: 863,
      y: 128,
      width: 26,
      height: 52,
      fill: "#38BDF8",
      fontSize: 4.5,
      textColor: "#FFFFFF",
      verticalText: true
    },
    {
      id: "stairs-dg",
      label: "STAIRS",
      i18nKey: "map.stairs",
      x: 863,
      y: 180,
      width: 26,
      height: 20,
      fill: "#065F46",
      fontSize: 5,
      textColor: "#FFFFFF",
      isStairs: true
    },

    // Sub rooms under Bag House right (y: 316..340)
    {
      id: "toilet-small",
      label: "TOILET",
      i18nKey: "map.toiletSmall",
      x: 795,
      y: 316,
      width: 22,
      height: 24,
      fill: "#38BDF8",
      fontSize: 5.5,
      textColor: "#FFFFFF",
      verticalText: true
    },
    {
      id: "record-room",
      label: "RECORD\nROOM",
      i18nKey: "map.recordRoom",
      x: 817,
      y: 316,
      width: 46,
      height: 24,
      fill: "#38BDF8",
      fontSize: 5.5,
      textColor: "#FFFFFF"
    },
    {
      id: "stairs-bag",
      label: "STAIRS",
      i18nKey: "map.stairs",
      x: 863,
      y: 316,
      width: 26,
      height: 24,
      fill: "#065F46",
      fontSize: 5,
      textColor: "#FFFFFF",
      isStairs: true
    },

    // Reception & Meeting room right side strip (x: 861..889)
    {
      id: "reception",
      label: "RECEPTION\nAREA",
      i18nKey: "map.reception",
      x: 861,
      y: 356,
      width: 28,
      height: 55,
      fill: "#E0F2FE",
      fontSize: 5.5,
      textColor: "#0369A1",
      verticalText: true
    },
    {
      id: "meeting-room",
      label: "MEETING\nROOM",
      i18nKey: "map.meetingRoom",
      x: 861,
      y: 411,
      width: 28,
      height: 57,
      fill: "#E0F2FE",
      fontSize: 5.5,
      textColor: "#0369A1",
      verticalText: true
    },

    // QA Lab, Conference Hall and Stairs directly attached above Store (y: 468..500)
    {
      id: "qa-lab",
      label: "QA\nLAB",
      i18nKey: "map.qaLab",
      x: 795,
      y: 468,
      width: 28,
      height: 32,
      fill: "#38BDF8",
      fontSize: 6,
      textColor: "#FFFFFF"
    },
    {
      id: "conf-hall",
      label: "CONFERANCE\nHALL",
      i18nKey: "map.confHall",
      x: 823,
      y: 468,
      width: 44,
      height: 32,
      fill: "#38BDF8",
      fontSize: 5.5,
      textColor: "#FFFFFF"
    },
    {
      id: "stairs-conf",
      label: "STAIRS",
      i18nKey: "map.stairs",
      x: 867,
      y: 468,
      width: 22,
      height: 32,
      fill: "#065F46",
      fontSize: 5,
      textColor: "#FFFFFF",
      isStairs: true
    }
  ],
  exits: [
    {
      id: "exit-1783495191079",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 35,
      y: 6,
      width: 50,
      height: 38,
      arrowDirection: "up"
    },
    {
      id: "exit-1783495192196",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 555,
      y: 6,
      width: 50,
      height: 38,
      arrowDirection: "up"
    },
    {
      id: "exit-1783495193102",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 896,
      y: 35,
      width: 44,
      height: 36,
      arrowDirection: "right"
    },
    {
      id: "exit-1783495193815",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 896,
      y: 191,
      width: 44,
      height: 36,
      arrowDirection: "right"
    },
    {
      id: "exit-1783495194438",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 896,
      y: 330,
      width: 44,
      height: 36,
      arrowDirection: "right"
    },
    {
      id: "exit-1783495195151",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 896,
      y: 420,
      width: 44,
      height: 36,
      arrowDirection: "right"
    },
    {
      id: "exit-1783495195776",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 896,
      y: 466,
      width: 44,
      height: 38,
      arrowDirection: "right"
    },
    {
      id: "exit-1783495197203",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 555,
      y: 550,
      width: 50,
      height: 38,
      arrowDirection: "down"
    },
    {
      id: "exit-1783495474793",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 35,
      y: 270,
      width: 50,
      height: 38,
      arrowDirection: "left"
    },
    {
      id: "exit-1783500239331",
      targetNode: "G1",
      label: "EMERGENCY EXIT",
      i18nKey: "map.emergencyExit",
      x: 35,
      y: 395,
      width: 50,
      height: 38,
      arrowDirection: "left"
    }
  ],
  gates: [
    {
      id: "gate-1",
      label: "GATE\nNO\n1",
      i18nKey: "map.gate1",
      x: 942,
      y: 6,
      width: 46,
      height: 48,
      fill: PLANT_MAP_THEME.gateCrimson.fill,
      textColor: PLANT_MAP_THEME.gateCrimson.text,
      verticalText: true
    },
    {
      id: "gate-2",
      label: "GATE NO\n2",
      i18nKey: "map.gate2",
      x: 610,
      y: 552,
      width: 65,
      height: 36,
      fill: PLANT_MAP_THEME.gateCrimson.fill,
      textColor: PLANT_MAP_THEME.gateCrimson.text
    },
    {
      id: "gate-3",
      label: "GATE NO\n3",
      i18nKey: "map.gate3",
      x: 6,
      y: 552,
      width: 65,
      height: 36,
      fill: PLANT_MAP_THEME.gateCrimson.fill,
      textColor: PLANT_MAP_THEME.gateCrimson.text
    }
  ],
  assemblyArea: {
    id: "assembly-main",
    label: "EMERGENCY\nASSEMBLY AREA",
    i18nKey: "map.emergencyAssemblyArea",
    x: 686,
    y: 544,
    width: 54,
    height: 48
  },
  corridors: [
    // --- 1. OUTER PERIMETER EVACUATION HIGHWAY (Connected Clean Loop) ---
    // Top Walkway: from left corner (60, 26) across to right corner (948, 26)
    { points: [60, 26, 948, 26], dashed: true, hasArrows: true },
    // Right Walkway: from top corner (948, 26) down to bottom corner (948, 568)
    { points: [948, 26, 948, 568], dashed: true, hasArrows: true },
    // Bottom Walkway: from right corner (948, 568) across past Assembly (713, 568) to left corner (60, 568)
    { points: [948, 568, 60, 568], dashed: true, hasArrows: true },
    // Left Walkway: from bottom corner (60, 568) up to top corner (60, 26)
    { points: [60, 568, 60, 26], dashed: true, hasArrows: true },

    // --- 2. MAIN INTERIOR WALKWAY ARTERIES ---
    // Vertical Corridor A (Left): runs between Left CRA column and Center CRA from y: 26 to y: 492
    { points: [285, 26, 285, 492], dashed: true, hasArrows: true },
    // Vertical Corridor B (Mid-Center): between Center CRA/Hot-1 and Tall Hot-2 (leads to top and bottom exits)
    { points: [580, 26, 580, 568], dashed: true },
    // Vertical Corridor C (Mid-Right): between Tall Hot-2 and Right Bag-H/Admin column - strictly starts below IDSM (y: 105) and runs to y: 505 (bottom of Tall Hot-2)
    { points: [775, 105, 775, 505], dashed: true },

    // Horizontal Corridor 1 (Top connector under MRM M/C & IDSM):
    { points: [580, 105, 775, 105], dashed: true },
    // Horizontal Corridor 2 (Between DG Area and Bag House):
    { points: [775, 209, 948, 209], dashed: true },
    // Horizontal Corridor 3 (Between Bag House amenities and Samvaad Hall):
    { points: [775, 348, 948, 348], dashed: true },
    // Internal Vertical Corridor (Between Samvaad/Admin and Reception/Meeting):
    { points: [852, 348, 852, 468], dashed: true },
    // Exit Corridor from Stairs/Conference Hall to Right Emergency Exit:
    { points: [852, 468, 948, 468], dashed: true },
    // Horizontal Corridor 4 (Under Tall Hot-2): connects Mid-Center (580, 505) to Mid-Right (775, 505)
    { points: [580, 505, 775, 505], dashed: true },

    // Horizontal Corridor 5 (Middle cross-artery): from Left Exit (60, 290) across to Mid-Center (580, 290)
    { points: [60, 290, 580, 290], dashed: true },
    // Horizontal Corridor 6 (Between both Cold Refining Areas): from Mid-Left Exit (60, 422) across between cra-center-mid and cra-center-bot to Central Artery (580, 422)
    { points: [60, 422, 580, 422], dashed: true, hasArrows: true },
    // Horizontal Corridor 7 (Bottom connector): between cra-center-bot and Storage/Toilet/Dispatch
    { points: [285, 492, 580, 492], dashed: true }
  ]
}
