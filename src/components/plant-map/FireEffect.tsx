import { useEffect, useRef } from "react"

interface FireEffectProps {
  size?: number
}

export function FireEffect({ size = 60 }: FireEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    const animate = () => {
      ctx.clearRect(0, 0, size, size)

      // Emit new particles near the bottom-middle of the canvas
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: size / 2 + (Math.random() - 0.5) * (size * 0.15),
          y: size * 0.85,
          vx: (Math.random() - 0.5) * (size * 0.03),
          vy: -Math.random() * (size * 0.05) - (size * 0.03),
          life: 0,
          maxLife: 20 + Math.random() * 15,
          size: (size * 0.06) + Math.random() * (size * 0.08),
        })
      }

      particles.current = particles.current.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        const alpha = 1 - p.life / p.maxLife
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
        gradient.addColorStop(0.4, `rgba(255, 100, 20, ${alpha * 0.8})`)
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
  }, [size])

  return (
    <div className="w-full h-full relative pointer-events-none flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
