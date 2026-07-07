export type Point = { x: number; y: number }
export type NodeDef = Point & { room?: boolean; target?: boolean; gate?: boolean }
export type GraphNodes = Record<string, NodeDef>
export type EdgeDef = [string, string]
export type Segment = { aKey: string; bKey: string; ax: number; ay: number; bx: number; by: number }

export const N: GraphNodes = {
  G3: { x: 40, y: 585, gate: true },
  G1: { x: 992, y: 34, gate: true },
  G2: { x: 641, y: 582, gate: true },
  ASSEMBLY: { x: 726, y: 564, target: true },
  COLD: { x: 201, y: 192, room: true },
  HOT: { x: 520, y: 201, room: true },
  DG: { x: 838, y: 139, room: true },
  "Hot-2": { x: 695, y: 318, room: true },
  N_7700: { x: 349, y: 75, room: true },
  N_1807: { x: 392, y: 214, room: true },
  N_6420: { x: 439, y: 455, room: true },
  N_8389: { x: 282, y: 525, room: true },
  N_9219: { x: 407, y: 524, room: true },
  N_9905: { x: 509, y: 521, room: true },
  N_7286: { x: 666, y: 75, room: true },
  N_2744: { x: 498, y: 71, room: true },
  N_7335: { x: 181, y: 487, room: true },
  N_1321: { x: 205, y: 360, room: true },
  N_2210: { x: 443, y: 359, room: true },
  N_6272: { x: 772, y: 65, room: true },
  N_9577: { x: 967, y: 181, room: true },
}

export const EDGES: EdgeDef[] = [
]

export const INITIAL_COLLISION_ZONES = [
  { id: 'cold-refining-1', x: 135, y: 68, width: 139, height: 206 },
  { id: 'hot-refining-1', x: 466, y: 99, width: 105, height: 175 },
  { id: 'hot-refining-2', x: 613, y: 136, width: 151, height: 346 },
  { id: 'block-1783418719311', x: 141, y: 436, width: 83, height: 109 },
  { id: 'block-1783418720425', x: 137, y: 310, width: 146, height: 100 },
  { id: 'block-1783418784927', x: 316, y: 308, width: 260, height: 100 },
  { id: 'block-1783418785737', x: 333, y: 167, width: 111, height: 106 },
  { id: 'block-1783418787477', x: 316, y: 437, width: 258, height: 45 },
  { id: 'block-1783418788475', x: 226, y: 501, width: 329, height: 41 },
  { id: 'block-1783418794991', x: 804, y: 338, width: 93, height: 204 },
  { id: 'block-1783419066894', x: 307, y: 52, width: 265, height: 42 },
  { id: 'block-1783419105063', x: 610, y: 51, width: 129, height: 47 },
  { id: 'block-1783419107121', x: 807, y: 51, width: 87, height: 152 },
  { id: 'block-1783419108680', x: 807, y: 221, width: 66, height: 108 },
  { id: 'block-1783419116763', x: 939, y: 57, width: 61, height: 533 },
  { id: 'block-1783419226029', x: 740, y: 51, width: 66, height: 28 },
  { id: 'block-1783419249230', x: -28, y: -1, width: 62, height: 101 },
  { id: 'block-1783419250358', x: 358, y: -3, width: 239, height: 20 },
  { id: 'block-1783419251274', x: 73, y: -3, width: 152, height: 20 },
  { id: 'block-1783419252999', x: 14, y: 467, width: 24, height: 83 },
]

export const EXITS = ["G1", "G2", "G3", "ASSEMBLY"]

export const ROOMS = Object.keys(N).filter(k => N[k].room).map(k => ({ nodeId: k, name: `Area ${k}` }))

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
