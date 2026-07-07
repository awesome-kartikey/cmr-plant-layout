export type Point = { x: number; y: number }
export type NodeDef = Point & { room?: boolean; target?: boolean; gate?: boolean }
export type GraphNodes = Record<string, NodeDef>
export type EdgeDef = [string, string]
export type Segment = { aKey: string; bKey: string; ax: number; ay: number; bx: number; by: number }

export const N: GraphNodes = {
  G3: { x: 40, y: 585, gate: true },
  G1: { x: 992, y: 34, gate: true },
  COLD: { x: 201, y: 192, room: true },
  HOT: { x: 520, y: 201, room: true },
  ASSEMBLY: { x: 726, y: 564, target: true },
  G2: { x: 641, y: 582, gate: true },
  DG: { x: 838, y: 139, room: true },
  "Hot-2": { x: 695, y: 318, room: true },
  N_7700: { x: 349, y: 75, room: true },
  N_1807: { x: 392, y: 214, room: true },
  N_1321: { x: 203, y: 354, room: true },
  N_2210: { x: 445, y: 354, room: true },
  N_6420: { x: 439, y: 455, room: true },
  N_7335: { x: 170, y: 471, room: true },
  N_8389: { x: 290, y: 519, room: true },
  N_9219: { x: 397, y: 517, room: true },
  N_9905: { x: 504, y: 521, room: true },
  N_6272: { x: 762, y: 62, room: true },
  N_7286: { x: 666, y: 75, room: true },
  N_2744: { x: 498, y: 71, room: true },
  P_0248: { x: 964, y: 33 },
  P_6987: { x: 66, y: 30 },
  P_5235: { x: 63, y: 558 },
  P_2373: { x: 918, y: 559 },
  P_4306: { x: 918, y: 487 },
  P_6774: { x: 918, y: 322 },
  P_8998: { x: 911, y: 205 },
  P_1609: { x: 913, y: 78 },
  P_5635: { x: 910, y: 33 },
  P_0244: { x: 585, y: 289 },
  P_2114: { x: 583, y: 418 },
  P_5162: { x: 589, y: 492 },
  P_9167: { x: 587, y: 560 },
  P_2363: { x: 587, y: 30 },
  P_4603: { x: 589, y: 113 },
  P_4716: { x: 775, y: 112 },
  P_2444: { x: 778, y: 211 },
  P_2171: { x: 789, y: 334 },
  P_7228: { x: 783, y: 502 },
  P_3317: { x: 123, y: 62 },
  P_5333: { x: 292, y: 62 },
  P_8178: { x: 296, y: 292 },
  P_2553: { x: 295, y: 423 },
  P_4097: { x: 296, y: 488 },
  P_5350: { x: 67, y: 295 },
  P_1807: { x: 66, y: 425 },
  P_7093: { x: 356, y: 560 },
  P_7552: { x: 293, y: 125 },
  P_9586: { x: 294, y: 204 },
  P_3549: { x: 820, y: 33 },
  P_4597: { x: 736, y: 32 },
  P_5869: { x: 652, y: 31 },
  P_8690: { x: 523, y: 31 },
  P_9819: { x: 457, y: 30 },
  P_0909: { x: 398, y: 29 },
  P_2475: { x: 335, y: 29 },
  P_4578: { x: 290, y: 29 },
  P_5644: { x: 244, y: 29 },
  P_6656: { x: 196, y: 30 },
  P_7460: { x: 159, y: 30 },
  P_8935: { x: 116, y: 30 },
  P_6925: { x: 66, y: 64 },
  P_9128: { x: 66, y: 103 },
  P_0746: { x: 67, y: 137 },
  P_2101: { x: 68, y: 173 },
  P_3174: { x: 69, y: 204 },
  P_4540: { x: 68, y: 237 },
  P_5904: { x: 67, y: 270 },
  P_9134: { x: 67, y: 322 },
  P_0452: { x: 68, y: 347 },
  P_2396: { x: 66, y: 377 },
  P_3941: { x: 65, y: 403 },
  P_7563: { x: 65, y: 451 },
  P_8880: { x: 65, y: 476 },
  P_0210: { x: 64, y: 500 },
  P_1546: { x: 64, y: 528 },
  P_8345: { x: 92, y: 560 },
  P_1294: { x: 126, y: 561 },
  P_2180: { x: 149, y: 562 },
  P_3361: { x: 181, y: 559 },
  P_5160: { x: 211, y: 561 },
  P_6912: { x: 246, y: 561 },
  P_7855: { x: 270, y: 559 },
  P_0978: { x: 299, y: 558 },
  P_1968: { x: 328, y: 560 },
  P_3333: { x: 392, y: 560 },
  P_4751: { x: 428, y: 558 },
  P_5646: { x: 473, y: 561 },
  P_6610: { x: 511, y: 560 },
  P_7414: { x: 547, y: 560 },
  P_1094: { x: 619, y: 559 },
  P_2242: { x: 647, y: 559 },
  P_4897: { x: 684, y: 561 },
  P_6883: { x: 752, y: 560 },
  P_7801: { x: 781, y: 562 },
  P_8528: { x: 816, y: 562 },
  P_9317: { x: 844, y: 561 },
  P_0828: { x: 874, y: 558 },
  P_3896: { x: 921, y: 528 },
  P_5773: { x: 918, y: 451 },
  P_6652: { x: 917, y: 423 },
  P_7794: { x: 917, y: 389 },
  P_8744: { x: 916, y: 359 },
  P_1047: { x: 915, y: 284 },
  P_2027: { x: 915, y: 254 },
  P_6056: { x: 910, y: 163 },
  P_7248: { x: 909, y: 122 },
  P_1442: { x: 233, y: 424 },
  P_2252: { x: 197, y: 424 },
  P_3088: { x: 151, y: 422 },
  P_4073: { x: 105, y: 421 },
  P_2911: { x: 240, y: 487 },
  P_6591: { x: 297, y: 452 },
  P_8751: { x: 297, y: 383 },
  P_9777: { x: 297, y: 346 },
  P_0794: { x: 297, y: 314 },
  P_3351: { x: 241, y: 291 },
  P_4140: { x: 209, y: 291 },
  P_5054: { x: 172, y: 293 },
  P_6497: { x: 130, y: 290 },
  P_3112: { x: 297, y: 269 },
  P_4166: { x: 294, y: 239 },
  P_6221: { x: 294, y: 167 },
  P_2042: { x: 224, y: 59 },
  P_2938: { x: 174, y: 59 },
  P_2966: { x: 336, y: 291 },
  P_3860: { x: 366, y: 292 },
  P_4627: { x: 409, y: 294 },
  P_5812: { x: 444, y: 291 },
  P_6455: { x: 486, y: 292 },
  P_7765: { x: 520, y: 290 },
  P_8597: { x: 552, y: 291 },
  P_0929: { x: 585, y: 251 },
  P_1816: { x: 588, y: 224 },
  P_2641: { x: 588, y: 193 },
  P_3480: { x: 588, y: 167 },
  P_4290: { x: 589, y: 136 },
  P_5954: { x: 588, y: 88 },
  P_6867: { x: 589, y: 60 },
  P_2937: { x: 739, y: 115 },
  P_3705: { x: 704, y: 114 },
  P_4458: { x: 662, y: 114 },
  P_5229: { x: 621, y: 112 },
  P_0331: { x: 326, y: 422 },
  P_1947: { x: 350, y: 424 },
  P_2672: { x: 374, y: 423 },
  P_3401: { x: 398, y: 421 },
  P_4129: { x: 428, y: 420 },
  P_4821: { x: 462, y: 421 },
  P_5528: { x: 499, y: 420 },
  P_6249: { x: 538, y: 420 },
  P_9434: { x: 587, y: 388 },
  P_0218: { x: 588, y: 352 },
  P_1042: { x: 589, y: 311 },
  P_5836: { x: 588, y: 446 },
  P_8276: { x: 544, y: 489 },
  P_9084: { x: 483, y: 491 },
  P_9854: { x: 422, y: 489 },
  P_0610: { x: 378, y: 491 },
  P_1742: { x: 335, y: 490 },
  P_7224: { x: 591, y: 514 },
  P_1298: { x: 649, y: 506 },
  P_2046: { x: 691, y: 504 },
  P_2870: { x: 728, y: 504 },
  P_4899: { x: 784, y: 444 },
  P_5719: { x: 784, y: 401 },
  P_6592: { x: 781, y: 365 },
  P_8545: { x: 778, y: 283 },
  P_0053: { x: 778, y: 237 },
  P_1957: { x: 778, y: 167 },
  P_2826: { x: 778, y: 137 },
  P_6657: { x: 817, y: 212 },
  P_7488: { x: 855, y: 208 },
}

export const EDGES: EdgeDef[] = [
  ["P_0248", "P_6987"], ["P_6987", "P_5235"], ["P_5235", "P_2373"], ["P_2373", "P_4306"], ["P_4306", "P_6774"], ["P_6774", "P_8998"], 
  ["P_8998", "P_1609"], ["P_1609", "P_5635"], ["P_0244", "P_2114"], ["P_2114", "P_5162"], ["P_5162", "P_9167"], ["P_2363", "P_4603"], 
  ["P_4603", "P_0244"], ["P_4603", "P_4716"], ["P_4716", "P_2444"], ["P_2444", "P_2171"], ["P_2171", "P_7228"], ["P_7228", "P_5162"], 
  ["P_9167", "ASSEMBLY"], ["ASSEMBLY", "P_2373"], ["P_6987", "P_3317"], ["P_3317", "P_5333"], ["P_5333", "P_8178"], ["P_8178", "P_2553"], 
  ["P_2553", "P_4097"], ["P_4097", "P_5162"], ["P_6987", "P_5350"], ["P_5350", "P_8178"], ["P_5350", "P_1807"], ["P_1807", "P_2553"], 
  ["P_5235", "P_7093"], ["P_5333", "P_7552"], ["P_7552", "P_9586"], ["P_9586", "P_8178"], ["P_0248", "P_5635"], ["P_5635", "P_3549"], 
  ["P_3549", "P_4597"], ["P_4597", "P_5869"], ["P_5869", "P_2363"], ["P_2363", "P_8690"], ["P_8690", "P_9819"], ["P_9819", "P_0909"], 
  ["P_0909", "P_2475"], ["P_2475", "P_4578"], ["P_4578", "P_5644"], ["P_5644", "P_6656"], ["P_6656", "P_7460"], ["P_7460", "P_8935"], 
  ["P_8935", "P_6987"], ["P_6987", "P_6925"], ["P_6925", "P_9128"], ["P_9128", "P_0746"], ["P_0746", "P_2101"], ["P_2101", "P_3174"], 
  ["P_3174", "P_4540"], ["P_4540", "P_5904"], ["P_5904", "P_5350"], ["P_5350", "P_9134"], ["P_9134", "P_0452"], ["P_0452", "P_2396"], 
  ["P_2396", "P_3941"], ["P_3941", "P_1807"], ["P_1807", "P_7563"], ["P_7563", "P_8880"], ["P_8880", "P_0210"], ["P_0210", "P_1546"], 
  ["P_1546", "P_5235"], ["P_5235", "G3"], ["P_5235", "P_8345"], ["P_8345", "P_1294"], ["P_1294", "P_2180"], ["P_2180", "P_3361"], 
  ["P_3361", "P_5160"], ["P_5160", "P_6912"], ["P_6912", "P_7855"], ["P_7855", "P_0978"], ["P_0978", "P_1968"], ["P_1968", "P_3333"], 
  ["P_3333", "P_4751"], ["P_4751", "P_5646"], ["P_5646", "P_6610"], ["P_6610", "P_7414"], ["P_7414", "P_9167"], ["P_9167", "P_1094"], 
  ["P_1094", "P_2242"], ["P_2242", "G2"], ["P_2242", "P_4897"], ["P_4897", "ASSEMBLY"], ["ASSEMBLY", "P_6883"], ["P_6883", "P_7801"], 
  ["P_7801", "P_8528"], ["P_8528", "P_9317"], ["P_9317", "P_0828"], ["P_0828", "P_2373"], ["P_2373", "P_3896"], ["P_3896", "P_4306"], 
  ["P_4306", "P_5773"], ["P_5773", "P_6652"], ["P_6652", "P_7794"], ["P_7794", "P_8744"], ["P_8744", "P_6774"], ["P_6774", "P_1047"], 
  ["P_1047", "P_2027"], ["P_2027", "P_8998"], ["P_8998", "P_6056"], ["P_6056", "P_7248"], ["P_7248", "P_1609"], ["P_2553", "P_1442"], 
  ["P_1442", "P_2252"], ["P_2252", "P_3088"], ["P_3088", "P_4073"], ["P_4073", "P_1807"], ["P_4097", "P_2911"], ["P_4097", "P_6591"], 
  ["P_6591", "P_2553"], ["P_2553", "P_8751"], ["P_8751", "P_9777"], ["P_9777", "P_0794"], ["P_0794", "P_8178"], ["P_8178", "P_3351"], 
  ["P_3351", "P_4140"], ["P_4140", "P_5054"], ["P_5054", "P_6497"], ["P_6497", "P_5350"], ["P_8178", "P_3112"], ["P_3112", "P_4166"], 
  ["P_4166", "P_9586"], ["P_9586", "P_6221"], ["P_6221", "P_7552"], ["P_5333", "P_2042"], ["P_2042", "P_2938"], ["P_2938", "P_3317"], 
  ["P_8178", "P_2966"], ["P_2966", "P_3860"], ["P_3860", "P_4627"], ["P_4627", "P_5812"], ["P_5812", "P_6455"], ["P_6455", "P_7765"], 
  ["P_7765", "P_8597"], ["P_8597", "P_0244"], ["P_0244", "P_0929"], ["P_0929", "P_1816"], ["P_1816", "P_2641"], ["P_2641", "P_3480"], 
  ["P_3480", "P_4290"], ["P_4290", "P_4603"], ["P_4603", "P_5954"], ["P_5954", "P_6867"], ["P_6867", "P_2363"], ["P_4716", "P_2937"], 
  ["P_2937", "P_3705"], ["P_3705", "P_4458"], ["P_4458", "P_5229"], ["P_5229", "P_4603"], ["P_2553", "P_0331"], ["P_0331", "P_1947"], 
  ["P_1947", "P_2672"], ["P_2672", "P_3401"], ["P_3401", "P_4129"], ["P_4129", "P_4821"], ["P_4821", "P_5528"], ["P_5528", "P_6249"], 
  ["P_6249", "P_2114"], ["P_2114", "P_9434"], ["P_9434", "P_0218"], ["P_0218", "P_1042"], ["P_1042", "P_0244"], ["P_2114", "P_5836"], 
  ["P_5836", "P_5162"], ["P_5162", "P_8276"], ["P_8276", "P_9084"], ["P_9084", "P_9854"], ["P_9854", "P_0610"], ["P_0610", "P_1742"], 
  ["P_1742", "P_4097"], ["P_5162", "P_7224"], ["P_7224", "P_9167"], ["P_7224", "P_1298"], ["P_1298", "P_2046"], ["P_2046", "P_2870"], 
  ["P_2870", "P_7228"], ["P_7228", "P_4899"], ["P_4899", "P_5719"], ["P_5719", "P_6592"], ["P_6592", "P_2171"], ["P_2171", "P_8545"], 
  ["P_8545", "P_0053"], ["P_0053", "P_2444"], ["P_2444", "P_1957"], ["P_1957", "P_2826"], ["P_2826", "P_4716"], ["P_2444", "P_6657"], 
  ["P_6657", "P_7488"], ["P_7488", "P_8998"], ["HOT", "P_2641"], ["N_1807", "P_9586"], ["N_1807", "P_3860"], ["P_4627", "N_1807"], 
  ["N_7700", "P_5333"], ["N_7700", "P_2475"], ["N_7700", "P_0909"], ["N_7700", "P_7552"], ["COLD", "P_6221"], ["COLD", "P_9586"], 
  ["COLD", "P_4166"], ["COLD", "P_2101"], ["COLD", "P_3174"], ["N_2744", "P_8690"], ["N_2744", "P_9819"], ["HOT", "P_6455"], 
  ["HOT", "P_7765"], ["HOT", "P_8597"], ["HOT", "P_1816"], ["HOT", "P_3480"], ["N_1321", "P_4140"], ["N_1321", "P_3351"], 
  ["N_1321", "P_5054"], ["N_1321", "P_3088"], ["N_1321", "P_2252"], ["N_1321", "P_1442"], ["N_7335", "P_2911"], ["N_7335", "P_2252"], 
  ["N_7335", "P_3088"], ["N_7335", "P_1442"], ["N_8389", "P_2911"], ["N_8389", "P_4097"], ["N_8389", "P_1742"], ["N_9219", "P_0610"], 
  ["N_9219", "P_9854"], ["N_9905", "P_9084"], ["N_9905", "P_8276"], ["N_2210", "P_3401"], ["N_2210", "P_5812"], ["N_2210", "P_4129"], 
  ["N_2210", "P_4821"], ["N_2210", "P_6455"], ["N_2210", "P_4627"], ["N_2744", "P_6867"], ["N_2744", "P_5954"], ["N_7286", "P_5869"], 
  ["N_7286", "P_5954"], ["N_7286", "P_4458"], ["N_7286", "P_6867"], ["N_7286", "P_3705"], ["N_6272", "P_4716"], ["N_6272", "P_2937"], 
  ["N_6272", "P_4597"], ["N_6272", "P_3549"], ["Hot-2", "P_1042"], ["Hot-2", "P_0218"], ["Hot-2", "P_0244"], ["Hot-2", "P_8545"], 
  ["Hot-2", "P_2171"], ["Hot-2", "P_6592"], ["DG", "P_2826"], ["DG", "P_1957"], ["DG", "P_4716"], 
  ["G1", "P_0248"], ["N_6420", "P_4129"],
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
