export type Point = { x: number; y: number }
export type NodeDef = Point & { room?: boolean; target?: boolean; gate?: boolean; name?: string }
export type GraphNodes = Record<string, NodeDef>
export type EdgeDef = [string, string]
export type Segment = { aKey: string; bKey: string; ax: number; ay: number; bx: number; by: number }


export const N: GraphNodes = {
  ASSEMBLY: { x: 713, y: 568, target: true },
  DG: { x: 829, y: 124, room: true, name: "DG Area" },
  CRA: { x: 437, y: 361, room: true, name: "Cold Refining Area" },
  SA: { x: 271, y: 525, room: true, name: "Storage Area" },
  TA: { x: 381, y: 525, room: true, name: "Toilet Area" },
  DO: { x: 501, y: 525, room: true, name: "Dispatch Office" },
  "CRA-2": { x: 171, y: 485, room: true, name: "Cold Refining Area" },
  "CRA-3": { x: 199, y: 361, room: true, name: "Cold Refining Area" },
  "CRA-4": { x: 196, y: 171, room: true, name: "Cold Refining Area" },
  "BH-0": { x: 360, y: 71, room: true, name: "Bag House" },
  "BH-1": { x: 498, y: 71, room: true, name: "Bag House" },
  "CRA-5": { x: 381, y: 220, room: true, name: "Cold Refining Area" },
  "HOT-1": { x: 509, y: 190, room: true, name: "Hot Refining Area" },
  "CRA-6": { x: 437, y: 458, room: true, name: "Cold Refining Area" },
  "Hot-2": { x: 679, y: 311, room: true, name: "Hot Refining Area" },
  "MRM M/C": { x: 667, y: 73, room: true, name: "MRM MC" },
  "IDSM": { x: 755, y: 67, room: true, name: "IDSM" },
  "PNG": { x: 960, y: 185, room: true, name: "PNG" },
  "Admin-B": { x: 819, y: 446, room: true, name: "Admin Block" },
  "Samvad": { x: 819, y: 390, room: true, name: "Samvad Hall" },
  "Bag-H": { x: 829, y: 267, room: true, name: "Bag House" },
  "Store": { x: 842, y: 526, room: true, name: "Store" },
}

export const EDGES: EdgeDef[] = [
]

export const INITIAL_COLLISION_ZONES = [
  { id: 'cold-refining-1', x: 127, y: 68, width: 139, height: 206 },
  { id: 'hot-refining-1', x: 457, y: 103, width: 105, height: 175 },
  { id: 'hot-refining-2', x: 604, y: 138, width: 150, height: 346 },
  { id: 'block-cra-bot-left', x: 133, y: 436, width: 77, height: 110 },
  { id: 'block-cra-mid-left', x: 127, y: 313, width: 145, height: 96 },
  { id: 'block-cra-center-mid', x: 307, y: 311, width: 260, height: 100 },
  { id: 'block-cra-center-top', x: 328, y: 165, width: 106, height: 110 },
  { id: 'block-cra-center-bot', x: 307, y: 436, width: 260, height: 44 },
  { id: 'block-bottom-row', x: 216, y: 504, width: 350, height: 42 },
  { id: 'block-bag-top', x: 297, y: 50, width: 250, height: 43 },
  { id: 'block-mrm-mc', x: 610, y: 50, width: 115, height: 45 },
  { id: 'block-idsm', x: 725, y: 50, width: 60, height: 45 },
  { id: 'block-dg-area', x: 795, y: 48, width: 94, height: 152 },
  { id: 'block-bag-right', x: 795, y: 218, width: 94, height: 122 },
  { id: 'block-samvaad-admin', x: 795, y: 356, width: 48, height: 112 },
  { id: 'block-reception-meeting', x: 861, y: 356, width: 28, height: 112 },
  { id: 'block-qa-conf', x: 795, y: 468, width: 94, height: 32 },
  { id: 'block-store', x: 795, y: 500, width: 94, height: 52 },
  { id: 'block-png', x: 935, y: 150, width: 50, height: 70 },
]

export const EXIT_ZONES = [
  { id: 'exit-1783495191079', x: 35, y: 6, width: 50, height: 38, targetNode: 'G1' },
  { id: 'exit-1783495192196', x: 555, y: 6, width: 50, height: 38, targetNode: 'G1' },
  { id: 'exit-1783495193102', x: 896, y: 35, width: 44, height: 36, targetNode: 'G1' },
  { id: 'exit-1783495193815', x: 896, y: 191, width: 44, height: 36, targetNode: 'G1' },
  { id: 'exit-1783495194438', x: 896, y: 330, width: 44, height: 36, targetNode: 'G1' },
  { id: 'exit-1783495195151', x: 896, y: 420, width: 44, height: 36, targetNode: 'G1' },
  { id: 'exit-1783495195776', x: 896, y: 466, width: 44, height: 38, targetNode: 'G1' },
  { id: 'exit-1783495197203', x: 555, y: 550, width: 50, height: 38, targetNode: 'G1' },
  { id: 'exit-1783495474793', x: 35, y: 270, width: 50, height: 38, targetNode: 'G1' },
  { id: 'exit-1783500239331', x: 35, y: 395, width: 50, height: 38, targetNode: 'G1' },
]

export const PATH_BLOCKS = [
  { x: 700, y: 525 },
  { x: 700, y: 500 },
  { x: 725, y: 500 },
  { x: 750, y: 500 },
  { x: 775, y: 500 },
  { x: 775, y: 475 },
  { x: 775, y: 450 },
  { x: 775, y: 425 },
  { x: 775, y: 400 },
  { x: 775, y: 375 },
  { x: 775, y: 325 },
  { x: 775, y: 350 },
  { x: 775, y: 300 },
  { x: 775, y: 275 },
  { x: 775, y: 250 },
  { x: 775, y: 225 },
  { x: 775, y: 200 },
  { x: 775, y: 175 },
  { x: 775, y: 150 },
  { x: 775, y: 125 },
  { x: 775, y: 100 },
  { x: 750, y: 100 },
  { x: 725, y: 100 },
  { x: 700, y: 100 },
  { x: 650, y: 100 },
  { x: 675, y: 100 },
  { x: 625, y: 100 },
  { x: 600, y: 100 },
  { x: 575, y: 100 },
  { x: 575, y: 125 },
  { x: 575, y: 150 },
  { x: 575, y: 175 },
  { x: 575, y: 200 },
  { x: 575, y: 225 },
  { x: 575, y: 250 },
  { x: 575, y: 275 },
  { x: 550, y: 275 },
  { x: 525, y: 275 },
  { x: 500, y: 275 },
  { x: 450, y: 275 },
  { x: 475, y: 275 },
  { x: 425, y: 275 },
  { x: 400, y: 275 },
  { x: 375, y: 275 },
  { x: 350, y: 275 },
  { x: 325, y: 275 },
  { x: 300, y: 275 },
  { x: 275, y: 275 },
  { x: 250, y: 275 },
  { x: 225, y: 275 },
  { x: 200, y: 275 },
  { x: 175, y: 275 },
  { x: 150, y: 275 },
  { x: 125, y: 275 },
  { x: 100, y: 275 },
  { x: 75, y: 275 },
  { x: 50, y: 275 },
  { x: 50, y: 300 },
  { x: 50, y: 325 },
  { x: 50, y: 350 },
  { x: 50, y: 375 },
  { x: 50, y: 400 },
  { x: 50, y: 425 },
  { x: 50, y: 450 },
  { x: 50, y: 475 },
  { x: 50, y: 500 },
  { x: 50, y: 525 },
  { x: 50, y: 550 },
  { x: 75, y: 550 },
  { x: 100, y: 550 },
  { x: 125, y: 550 },
  { x: 150, y: 550 },
  { x: 175, y: 550 },
  { x: 225, y: 550 },
  { x: 200, y: 550 },
  { x: 250, y: 550 },
  { x: 300, y: 550 },
  { x: 275, y: 550 },
  { x: 325, y: 550 },
  { x: 350, y: 550 },
  { x: 375, y: 550 },
  { x: 400, y: 550 },
  { x: 425, y: 550 },
  { x: 450, y: 550 },
  { x: 475, y: 550 },
  { x: 500, y: 550 },
  { x: 550, y: 550 },
  { x: 525, y: 550 },
  { x: 575, y: 550 },
  { x: 600, y: 550 },
  { x: 625, y: 550 },
  { x: 650, y: 550 },
  { x: 675, y: 550 },
  { x: 700, y: 550 },
  { x: 725, y: 550 },
  { x: 750, y: 550 },
  { x: 775, y: 550 },
  { x: 800, y: 550 },
  { x: 825, y: 550 },
  { x: 850, y: 550 },
  { x: 875, y: 550 },
  { x: 900, y: 550 },
  { x: 900, y: 525 },
  { x: 900, y: 475 },
  { x: 900, y: 500 },
  { x: 900, y: 450 },
  { x: 900, y: 425 },
  { x: 900, y: 400 },
  { x: 900, y: 375 },
  { x: 900, y: 350 },
  { x: 900, y: 325 },
  { x: 900, y: 300 },
  { x: 900, y: 275 },
  { x: 900, y: 250 },
  { x: 900, y: 225 },
  { x: 900, y: 200 },
  { x: 900, y: 175 },
  { x: 900, y: 150 },
  { x: 900, y: 125 },
  { x: 900, y: 75 },
  { x: 900, y: 100 },
  { x: 900, y: 50 },
  { x: 900, y: 25 },
  { x: 850, y: 25 },
  { x: 875, y: 25 },
  { x: 825, y: 25 },
  { x: 800, y: 25 },
  { x: 775, y: 25 },
  { x: 750, y: 25 },
  { x: 725, y: 25 },
  { x: 700, y: 25 },
  { x: 675, y: 25 },
  { x: 650, y: 25 },
  { x: 625, y: 25 },
  { x: 600, y: 25 },
  { x: 575, y: 25 },
  { x: 575, y: 50 },
  { x: 575, y: 75 },
  { x: 550, y: 25 },
  { x: 525, y: 25 },
  { x: 500, y: 25 },
  { x: 475, y: 25 },
  { x: 450, y: 25 },
  { x: 425, y: 25 },
  { x: 400, y: 25 },
  { x: 375, y: 25 },
  { x: 350, y: 25 },
  { x: 325, y: 25 },
  { x: 300, y: 25 },
  { x: 275, y: 25 },
  { x: 250, y: 25 },
  { x: 225, y: 25 },
  { x: 200, y: 25 },
  { x: 175, y: 25 },
  { x: 150, y: 25 },
  { x: 125, y: 25 },
  { x: 100, y: 25 },
  { x: 75, y: 25 },
  { x: 50, y: 25 },
  { x: 50, y: 50 },
  { x: 50, y: 75 },
  { x: 50, y: 100 },
  { x: 50, y: 125 },
  { x: 50, y: 150 },
  { x: 50, y: 175 },
  { x: 50, y: 200 },
  { x: 50, y: 225 },
  { x: 50, y: 250 },
  { x: 275, y: 250 },
  { x: 275, y: 225 },
  { x: 275, y: 200 },
  { x: 275, y: 175 },
  { x: 275, y: 150 },
  { x: 275, y: 125 },
  { x: 275, y: 100 },
  { x: 275, y: 75 },
  { x: 275, y: 50 },
  { x: 250, y: 50 },
  { x: 225, y: 50 },
  { x: 200, y: 50 },
  { x: 175, y: 50 },
  { x: 150, y: 50 },
  { x: 125, y: 50 },
  { x: 100, y: 50 },
  { x: 75, y: 50 },
  { x: 800, y: 200 },
  { x: 825, y: 200 },
  { x: 850, y: 200 },
  { x: 875, y: 200 },
  { x: 875, y: 225 },
  { x: 800, y: 325 },
  { x: 825, y: 325 },
  { x: 850, y: 325 },
  { x: 850, y: 350 },
  { x: 850, y: 375 },
  { x: 850, y: 400 },
  { x: 850, y: 425 },
  { x: 850, y: 450 },
  { x: 825, y: 500 },
  { x: 850, y: 500 },
  { x: 875, y: 500 },
  { x: 875, y: 425 },
  { x: 875, y: 400 },
  { x: 275, y: 300 },
  { x: 275, y: 325 },
  { x: 275, y: 350 },
  { x: 275, y: 375 },
  { x: 275, y: 400 },
  { x: 275, y: 425 },
  { x: 275, y: 450 },
  { x: 275, y: 475 },
  { x: 250, y: 475 },
  { x: 225, y: 475 },
  { x: 200, y: 475 },
  { x: 300, y: 475 },
  { x: 325, y: 475 },
  { x: 350, y: 475 },
  { x: 375, y: 475 },
  { x: 400, y: 475 },
  { x: 425, y: 475 },
  { x: 450, y: 475 },
  { x: 475, y: 475 },
  { x: 500, y: 475 },
  { x: 525, y: 475 },
  { x: 550, y: 475 },
  { x: 575, y: 475 },
  { x: 575, y: 500 },
  { x: 600, y: 500 },
  { x: 625, y: 500 },
  { x: 650, y: 500 },
  { x: 675, y: 500 },
  { x: 575, y: 525 },
  { x: 575, y: 450 },
  { x: 575, y: 425 },
  { x: 575, y: 400 },
  { x: 575, y: 375 },
  { x: 575, y: 325 },
  { x: 575, y: 350 },
  { x: 575, y: 300 },
  { x: 525, y: 400 },
  { x: 75, y: 425 },
  { x: 75, y: 400 },
  { x: 100, y: 400 },
  { x: 100, y: 425 },
  { x: 125, y: 400 },
  { x: 125, y: 425 },
  { x: 150, y: 400 },
  { x: 150, y: 425 },
  { x: 175, y: 400 },
  { x: 175, y: 425 },
  { x: 200, y: 400 },
  { x: 200, y: 425 },
  { x: 225, y: 400 },
  { x: 225, y: 425 },
  { x: 250, y: 400 },
  { x: 250, y: 425 },
  { x: 300, y: 400 },
  { x: 300, y: 425 },
  { x: 325, y: 400 },
  { x: 325, y: 425 },
  { x: 350, y: 400 },
  { x: 350, y: 425 },
  { x: 375, y: 400 },
  { x: 400, y: 425 },
  { x: 400, y: 400 },
  { x: 375, y: 425 },
  { x: 425, y: 400 },
  { x: 425, y: 425 },
  { x: 450, y: 400 },
  { x: 450, y: 425 },
  { x: 475, y: 400 },
  { x: 475, y: 425 },
  { x: 500, y: 400 },
  { x: 500, y: 425 },
  { x: 525, y: 425 },
  { x: 550, y: 400 },
  { x: 550, y: 425 },
]


export const EXITS = ["G1", "G2", "G3", "ASSEMBLY"]

export const ROOMS = Object.keys(N).filter(k => N[k].room).map(k => ({ nodeId: k, name: N[k].name || `Area ${k}` }))

export function buildGraph(nodes: GraphNodes, edges: EdgeDef[]) {
  const adj: Record<string, string[]> = {}
  Object.keys(nodes).forEach((k) => {
    adj[k] = []
  })
  edges.forEach(([a, b]) => {
    if (!adj[a] || !adj[b]) return
    adj[a].push(b)
    adj[b].push(a)
  })

  const segs: Segment[] = edges.map(([a, b]) => {
    if (!nodes[a] || !nodes[b]) return null
    return {
      aKey: a,
      bKey: b,
      ax: nodes[a].x,
      ay: nodes[a].y,
      bx: nodes[b].x,
      by: nodes[b].y,
    }
  }).filter(s => s !== null) as Segment[]

  return { adj, segs }
}

export const DEFAULT_GRAPH = buildGraph(N, EDGES)

export type GridBlock = { x: number; y: number }

export function getGridKey(b: GridBlock) {
  return `${b.x},${b.y}`
}

export function findShortestGridPath(
  blocks: GridBlock[],
  start: GridBlock,
  targets: GridBlock[],
  blockSize: number = 20
): GridBlock[] | null {
  if (blocks.length === 0 || targets.length === 0) return null;

  const blockSet = new Set(blocks.map(getGridKey));
  if (!blockSet.has(getGridKey(start))) return null; // Start not in grid

  const targetKeys = new Set(targets.map(getGridKey));

  const queue: { block: GridBlock; path: GridBlock[] }[] = [{ block: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(getGridKey(start));

  while (queue.length > 0) {
    const { block, path } = queue.shift()!;

    if (targetKeys.has(getGridKey(block))) {
      return path; // Return shortest path
    }

    // Adjacent blocks (up, down, left, right)
    const neighbors = [
      { x: block.x + blockSize, y: block.y },
      { x: block.x - blockSize, y: block.y },
      { x: block.x, y: block.y + blockSize },
      { x: block.x, y: block.y - blockSize }
    ];

    for (const n of neighbors) {
      const key = getGridKey(n);
      if (blockSet.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push({ block: n, path: [...path, n] });
      }
    }
  }

  return null;
}

export function ptDist(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function ndDist(nodes: GraphNodes, a: string, b: string) {
  return ptDist(nodes[a], nodes[b])
}

export function dijkstra(nodes: GraphNodes, adj: Record<string, string[]>, start: string, end: string) {
  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const vis: Record<string, boolean> = {}

  Object.keys(nodes).forEach((k) => {
    dist[k] = Infinity
    prev[k] = null
  })
  dist[start] = 0

  while (true) {
    let u: string | null = null
    let mn = Infinity
    Object.keys(nodes).forEach((k) => {
      if (!vis[k] && dist[k] < mn) {
        mn = dist[k]
        u = k
      }
    })
    if (u === null || u === end) break
    vis[u] = true
    if (!adj[u]) continue
    adj[u].forEach((v) => {
      // Prevent routing through other hazard rooms (which act as shortcuts through walls)
      if (nodes[v].room && v !== start && v !== end) return

      const d = dist[u as string] + ndDist(nodes, u as string, v)
      if (d < dist[v]) {
        dist[v] = d
        prev[v] = u
      }
    })
  }

  const path: string[] = []
  let cur: string | null = end
  while (cur) {
    path.unshift(cur)
    cur = prev[cur]
  }
  return { path, dist: dist[end] }
}

export function getNearestExits(nodes: GraphNodes, adj: Record<string, string[]>, roomNode: string) {
  let minD = Infinity
  const dists: Record<string, { dist: number; path: string[] }> = {}
  EXITS.forEach((ex) => {
    if (!nodes[ex]) return
    const shortest = dijkstra(nodes, adj, roomNode, ex)
    dists[ex] = { dist: shortest.dist, path: shortest.path }
    if (shortest.dist < minD) minD = shortest.dist
  })
  return { dists, minD }
}

export function projOnSeg(px: number, py: number, s: Segment) {
  const dx = s.bx - s.ax
  const dy = s.by - s.ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return { x: s.ax, y: s.ay, t: 0 }
  let t = ((px - s.ax) * dx + (py - s.ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return { x: s.ax + t * dx, y: s.ay + t * dy, t }
}

export function findNearestSeg(segs: Segment[], px: number, py: number) {
  let best: Segment | null = null
  let bd = Infinity
  segs.forEach((s) => {
    const p = projOnSeg(px, py, s)
    const d = ptDist({ x: px, y: py }, p)
    if (d < bd) {
      bd = d
      best = s
    }
  })
  return { seg: best, dist: bd }
}

export function pickNextEdge(segs: Segment[], currentSeg: Segment, leavingEnd: "a" | "b", mousePt: Point) {
  const jx = leavingEnd === "a" ? currentSeg.ax : currentSeg.bx
  const jy = leavingEnd === "a" ? currentSeg.ay : currentSeg.by

  const candidates = segs.filter((s) => {
    if (s === currentSeg) return false
    return (s.ax === jx && s.ay === jy) || (s.bx === jx && s.by === jy)
  })

  if (candidates.length === 0) return null

  const mdx = mousePt.x - jx
  const mdy = mousePt.y - jy
  const mLen = Math.sqrt(mdx * mdx + mdy * mdy)
  if (mLen < 1) return candidates[0]

  let best: Segment | null = null
  let bestScore = -2

  candidates.forEach((s) => {
    const ox = s.ax === jx && s.ay === jy ? s.bx : s.ax
    const oy = s.ax === jx && s.ay === jy ? s.by : s.ay
    const odx = ox - jx
    const ody = oy - jy
    const oLen = Math.sqrt(odx * odx + ody * ody)
    if (oLen < 1) return

    const score = (odx / oLen) * (mdx / mLen) + (ody / oLen) * (mdy / mLen)
    if (score > bestScore) {
      bestScore = score
      best = s
    }
  })

  return best
}

export const IDEAL_ROUTES: Record<string, { exit: string, blocks: { x: number, y: number }[] }[]> = {
  "DG": [
    { exit: "exit-1783495193815", blocks: [{ x: 821, y: 123 }, { x: 821, y: 209 }, { x: 948, y: 209 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495193102", blocks: [{ x: 821, y: 123 }, { x: 821, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495192196", blocks: [{ x: 821, y: 123 }, { x: 775, y: 123 }, { x: 775, y: 105 }, { x: 580, y: 105 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA": [
    { exit: "exit-1783495197203", blocks: [{ x: 433, y: 357 }, { x: 580, y: 357 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495474793", blocks: [{ x: 433, y: 357 }, { x: 282, y: 357 }, { x: 282, y: 290 }, { x: 60, y: 290 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 433, y: 357 }, { x: 433, y: 422 }, { x: 60, y: 422 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA-2": [
    { exit: "exit-1783500239331", blocks: [{ x: 141, y: 494 }, { x: 141, y: 422 }, { x: 60, y: 422 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495197203", blocks: [{ x: 141, y: 494 }, { x: 282, y: 494 }, { x: 282, y: 492 }, { x: 580, y: 492 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA-3": [
    { exit: "exit-1783495474793", blocks: [{ x: 174, y: 356 }, { x: 60, y: 356 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 174, y: 356 }, { x: 60, y: 356 }, { x: 60, y: 422 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA-4": [
    { exit: "exit-1783495474793", blocks: [{ x: 174, y: 159 }, { x: 60, y: 159 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495191079", blocks: [{ x: 174, y: 159 }, { x: 60, y: 159 }, { x: 60, y: 26 }, { x: 60, y: 26 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "BH-0": [
    { exit: "exit-1783495191079", blocks: [{ x: 365, y: 71 }, { x: 282, y: 71 }, { x: 282, y: 26 }, { x: 60, y: 26 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495474793", blocks: [{ x: 365, y: 71 }, { x: 282, y: 71 }, { x: 282, y: 290 }, { x: 60, y: 290 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495192196", blocks: [{ x: 365, y: 71 }, { x: 580, y: 71 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "BH-1": [
    { exit: "exit-1783495192196", blocks: [{ x: 495, y: 71 }, { x: 580, y: 71 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495191079", blocks: [{ x: 495, y: 71 }, { x: 282, y: 71 }, { x: 282, y: 26 }, { x: 60, y: 26 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA-5": [
    { exit: "exit-1783495474793", blocks: [{ x: 370, y: 193 }, { x: 282, y: 193 }, { x: 282, y: 290 }, { x: 60, y: 290 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495197203", blocks: [{ x: 370, y: 193 }, { x: 282, y: 193 }, { x: 282, y: 290 }, { x: 580, y: 290 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
  ],
  "HOT-1": [
    { exit: "exit-1783495197203", blocks: [{ x: 506, y: 191 }, { x: 580, y: 191 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495192196", blocks: [{ x: 506, y: 191 }, { x: 580, y: 191 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "SA": [
    { exit: "exit-1783495197203", blocks: [{ x: 267, y: 525 }, { x: 267, y: 492 }, { x: 580, y: 492 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 267, y: 525 }, { x: 267, y: 492 }, { x: 60, y: 492 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "TA": [
    { exit: "exit-1783495197203", blocks: [{ x: 384, y: 525 }, { x: 384, y: 492 }, { x: 580, y: 492 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 384, y: 525 }, { x: 384, y: 492 }, { x: 60, y: 492 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "DO": [
    { exit: "exit-1783495197203", blocks: [{ x: 505, y: 525 }, { x: 505, y: 492 }, { x: 580, y: 492 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 505, y: 525 }, { x: 505, y: 492 }, { x: 60, y: 492 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "CRA-6": [
    { exit: "exit-1783495197203", blocks: [{ x: 433, y: 459 }, { x: 580, y: 459 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783500239331", blocks: [{ x: 433, y: 459 }, { x: 433, y: 422 }, { x: 60, y: 422 }, { x: 60, y: 568 }, { x: 713, y: 568 }] },
  ],
  "Hot-2": [
    { exit: "exit-1783495197203", blocks: [{ x: 679, y: 302 }, { x: 580, y: 302 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495194438", blocks: [{ x: 679, y: 302 }, { x: 775, y: 302 }, { x: 775, y: 348 }, { x: 948, y: 348 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495192196", blocks: [{ x: 679, y: 302 }, { x: 580, y: 302 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "MRM M/C": [
    { exit: "exit-1783495192196", blocks: [{ x: 654, y: 71 }, { x: 654, y: 26 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495193102", blocks: [{ x: 654, y: 71 }, { x: 654, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495197203", blocks: [{ x: 654, y: 71 }, { x: 654, y: 105 }, { x: 580, y: 105 }, { x: 580, y: 568 }, { x: 713, y: 568 }] },
  ],
  "IDSM": [
    { exit: "exit-1783495193102", blocks: [{ x: 751, y: 71 }, { x: 751, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495192196", blocks: [{ x: 751, y: 71 }, { x: 751, y: 26 }, { x: 580, y: 26 }, { x: 948, y: 26 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495193815", blocks: [{ x: 751, y: 71 }, { x: 751, y: 105 }, { x: 775, y: 105 }, { x: 775, y: 209 }, { x: 948, y: 209 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "PNG": [
    { exit: "exit-1783495193815", blocks: [{ x: 960, y: 185 }, { x: 948, y: 185 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495194438", blocks: [{ x: 960, y: 185 }, { x: 948, y: 348 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "Admin-B": [
    { exit: "exit-1783495195151", blocks: [{ x: 811, y: 429 }, { x: 844, y: 429 }, { x: 844, y: 418 }, { x: 948, y: 418 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495194438", blocks: [{ x: 811, y: 429 }, { x: 844, y: 429 }, { x: 844, y: 348 }, { x: 948, y: 348 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "Samvad": [
    { exit: "exit-1783495194438", blocks: [{ x: 811, y: 379 }, { x: 844, y: 379 }, { x: 844, y: 348 }, { x: 948, y: 348 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495195151", blocks: [{ x: 811, y: 379 }, { x: 844, y: 379 }, { x: 844, y: 418 }, { x: 948, y: 418 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "Bag-H": [
    { exit: "exit-1783495194438", blocks: [{ x: 821, y: 263 }, { x: 821, y: 348 }, { x: 948, y: 348 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
    { exit: "exit-1783495193815", blocks: [{ x: 821, y: 263 }, { x: 821, y: 209 }, { x: 948, y: 209 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
  "Store": [
    { exit: "exit-1783495195776", blocks: [{ x: 837, y: 525 }, { x: 837, y: 488 }, { x: 948, y: 488 }, { x: 948, y: 568 }, { x: 713, y: 568 }] },
  ],
}
