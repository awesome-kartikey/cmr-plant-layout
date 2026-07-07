import { useEffect, useRef } from "react"

interface FireEffectProps {
  x: number
  y: number
  size?: number
}

export function FireEffect({ x, y, size = 40 }: FireEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = 80
    const H = 80
    canvas.width = W
    canvas.height = H

    const animate = () => {
      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x: W / 2 + (Math.random() - 0.5) * 10,
          y: H,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 4 - 2,
          life: 0,
          maxLife: 30 + Math.random() * 20,
          size: 3 + Math.random() * 6,
        })
      }

      particles.current = particles.current.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        const alpha = 1 - p.life / p.maxLife
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(255, 100, 20, ${alpha * 0.8})`)
        gradient.addColorStop(1, `rgba(200, 40, 0, 0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        return p.life < p.maxLife
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ left: x - 40, top: y - 40, width: 80, height: 80 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
