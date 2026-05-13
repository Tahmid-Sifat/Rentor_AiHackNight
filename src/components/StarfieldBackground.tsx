'use client'
import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  alpha: number
  drift: number
  twinklePhase: number
  twinkleSpeed: number
  hue: number
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let stars: Star[] = []
    let shooting: ShootingStar[] = []
    let raf = 0
    let t = 0

    function resize() {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.floor((width * height) / 4500)
      const count = Math.min(Math.max(target, 80), 260)
      stars = Array.from({ length: count }, () => makeStar())
    }

    function makeStar(): Star {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.25,
        alpha: Math.random() * 0.6 + 0.35,
        drift: Math.random() * 0.04 + 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        hue: Math.random() < 0.18 ? 220 + Math.random() * 80 : 0,
      }
    }

    function maybeSpawnShootingStar() {
      if (reduced) return
      if (shooting.length >= 2) return
      if (Math.random() < 0.0025) {
        const fromLeft = Math.random() < 0.5
        const speed = 7 + Math.random() * 5
        shooting.push({
          x: fromLeft ? -50 : width + 50,
          y: Math.random() * height * 0.6,
          vx: fromLeft ? speed : -speed,
          vy: speed * 0.4,
          life: 0,
          ttl: 60 + Math.random() * 40,
        })
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height)

      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#05060f')
      bg.addColorStop(0.55, '#0a0822')
      bg.addColorStop(1, '#1a0a3a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      const nebulaShift = reduced ? 0 : Math.sin(t * 0.0015) * 60
      drawNebula(ctx, width * 0.22 + nebulaShift, height * 0.32, width * 0.55, [99, 102, 241], 0.22)
      drawNebula(ctx, width * 0.82 - nebulaShift * 0.6, height * 0.7, width * 0.45, [236, 72, 153], 0.16)
      drawNebula(ctx, width * 0.55, height * 0.15, width * 0.35, [56, 189, 248], 0.1)

      for (const s of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.twinklePhase + t * s.twinkleSpeed)
        const a = Math.min(1, s.alpha * tw)

        if (s.r > 1.05) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
          if (s.hue > 0) {
            halo.addColorStop(0, `hsla(${s.hue}, 100%, 80%, ${a * 0.6})`)
          } else {
            halo.addColorStop(0, `rgba(255, 255, 255, ${a * 0.5})`)
          }
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = halo
          ctx.fillRect(s.x - s.r * 4, s.y - s.r * 4, s.r * 8, s.r * 8)
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.hue > 0
          ? `hsla(${s.hue}, 100%, 88%, ${a})`
          : `rgba(255, 255, 255, ${a})`
        ctx.fill()

        if (!reduced) {
          s.y += s.drift
          if (s.y > height + 2) {
            s.y = -2
            s.x = Math.random() * width
          }
        }
      }

      maybeSpawnShootingStar()
      shooting = shooting.filter((sh) => {
        sh.life += 1
        sh.x += sh.vx
        sh.y += sh.vy
        const fade = Math.max(0, 1 - sh.life / sh.ttl)
        const tailX = sh.x - sh.vx * 6
        const tailY = sh.y - sh.vy * 6
        const grad = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y)
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
        grad.addColorStop(1, `rgba(255, 255, 255, ${0.85 * fade})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(sh.x, sh.y)
        ctx.stroke()
        return sh.life < sh.ttl && sh.x > -100 && sh.x < width + 100
      })

      t += 1
      raf = requestAnimationFrame(frame)
    }

    function drawNebula(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      rgb: [number, number, number],
      strength: number,
    ) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
      g.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${strength})`)
      g.addColorStop(0.6, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${strength * 0.25})`)
      g.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    resize()
    window.addEventListener('resize', resize)
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
