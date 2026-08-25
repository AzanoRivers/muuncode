import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RocketIcon } from '@/components/atoms'
import styles from './LaunchLoader.module.css'

interface Star {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
}

interface Cloud {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

const STAR_COUNT = 45
const CLOUD_COUNT = 4
const GROUND_HEIGHT = 24

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createStars(width: number, groundY: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, groundY),
    radius: randomBetween(0.5, 1.8),
    speed: randomBetween(10, 40),
    opacity: randomBetween(0.3, 1),
  }))
}

function createClouds(width: number, groundY: number): Cloud[] {
  return Array.from({ length: CLOUD_COUNT }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(-groundY, groundY),
    width: randomBetween(60, 120),
    height: randomBetween(20, 36),
    speed: randomBetween(6, 14),
  }))
}

interface LaunchLoaderProps {
  // When true, plays the exit transition once (rocket flies up out of frame, whole
  // box fades out) instead of the idle liftoff+bob loop. Station keeps this component
  // mounted for the duration of that animation before switching to the next screen,
  // see Station.tsx's EXIT_ANIMATION_MS.
  exiting?: boolean
}

// A tall "launch silo" box: a canvas draws a starfield and clouds continuously
// scrolling downward, plus a fixed ground strip, so the rocket sitting on top (a
// plain RocketIcon with a CSS bob animation, not drawn on the canvas) reads as
// climbing without ever actually moving from its spot. Shown by Station while it
// verifies the GitHub session, a network round trip that takes a couple of seconds.
export function LaunchLoader({ exiting = false }: LaunchLoaderProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    context.scale(dpr, dpr)

    const groundY = height - GROUND_HEIGHT
    const stars = createStars(width, groundY)
    const clouds = createClouds(width, groundY)

    function drawGround(ctx: CanvasRenderingContext2D) {
      const gradient = ctx.createLinearGradient(0, groundY, 0, height)
      gradient.addColorStop(0, 'rgba(11, 210, 255, 0.25)')
      gradient.addColorStop(1, 'rgba(4, 21, 40, 0.9)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, groundY, width, height - groundY)
    }

    function drawClouds(ctx: CanvasRenderingContext2D) {
      for (const cloud of clouds) {
        ctx.beginPath()
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(179, 102, 255, 0.14)'
        ctx.fill()
      }
    }

    function drawStars(ctx: CanvasRenderingContext2D) {
      for (const star of stars) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 248, 255, ${star.opacity})`
        ctx.fill()
      }
    }

    function draw(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, width, height)
      drawClouds(ctx)
      drawStars(ctx)
      drawGround(ctx)
    }

    if (prefersReducedMotion) {
      draw(context)
      return
    }

    let lastTime = performance.now()
    let frameId: number

    // Arrow function expression, not a hoisted `function` declaration: TypeScript
    // only keeps `context`'s narrowed (non-null) type inside a closure defined this
    // way, after the `if (!context) return` above.
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000
      lastTime = now

      for (const star of stars) {
        star.y += star.speed * delta
        if (star.y > groundY) {
          star.y = -star.radius
          star.x = randomBetween(0, width)
        }
      }

      for (const cloud of clouds) {
        cloud.y += cloud.speed * delta
        if (cloud.y - cloud.height / 2 > groundY) {
          cloud.y = -cloud.height
          cloud.x = randomBetween(0, width)
        }
      }

      draw(context)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [])

  const boxClassName = exiting ? `${styles.box} ${styles.exiting}` : styles.box
  const rocketClassName = exiting
    ? `${styles.rocketWrapper} ${styles.rocketExiting}`
    : styles.rocketWrapper

  return (
    <div className={boxClassName}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={rocketClassName}>
        <RocketIcon size={40} />
        <div className={styles.flame} />
      </div>
      <span className={styles.groundLabel}>{t('stationLoadingLabel')}</span>
    </div>
  )
}
