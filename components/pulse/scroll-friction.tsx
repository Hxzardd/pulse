"use client"

import { useEffect, useRef } from "react"
import { useMode } from "./mode-context"
import { KineticTracker } from "./kinetic-tracker"

/** Minimum vertical movement (px) before we treat the gesture as scroll and apply friction (avoids stealing taps). */
const TOUCH_SCROLL_THRESHOLD = 8

/** Selector for elements we should not capture touch scroll on (let native behavior handle taps/inputs). */
const TOUCH_CAPTURE_SKIP_SELECTOR = "button, a[href], input, select, textarea, [role='button']"

// applies scroll friction in cozy mode and auto-detects fatigue (desktop: wheel; mobile: touch)
export function useScrollFriction() {
  const { mode, setMode } = useMode()
  const isCozy = mode === "cozy"
  const trackerRef = useRef<KineticTracker | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFatigueTriggerRef = useRef<number>(0)
  const cooldownPeriod = 10000 // 10s cooldown to prevent rapid toggling
  const lastTouchYRef = useRef<number>(0)
  const touchScrollActiveRef = useRef<boolean>(false)
  /** Set in touchstart: whether this gesture started on a button/link (we never capture). Avoids mid-gesture flip when finger moves over a link. */
  const touchStartedOnInteractiveRef = useRef<boolean>(false)

  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new KineticTracker()
    }

    const tracker = trackerRef.current
    const baseFrictionFactor = 0.3 // reduces scroll by 70%
    const minScrollDistance = 5

    let lastScrollTop = window.scrollY || document.documentElement.scrollTop

    // track scroll for velocity calculation
    const handleScroll = () => {
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop
      tracker.recordScroll(currentScrollTop, Date.now())
      lastScrollTop = currentScrollTop
    }

    // apply friction in cozy mode (desktop: wheel)
    const handleWheel = (e: WheelEvent) => {
      if (!isCozy) {
        handleScroll()
        return
      }

      e.preventDefault()

      const frictionMultiplier = tracker.getFrictionMultiplier()
      const frictionFactor = baseFrictionFactor * frictionMultiplier
      const scrollDelta = e.deltaY * frictionFactor

      if (Math.abs(scrollDelta) < minScrollDistance) {
        return
      }

      window.scrollBy({
        top: scrollDelta,
        behavior: "auto",
      })

      tracker.recordScroll(window.scrollY || document.documentElement.scrollTop, Date.now())
    }

    // mobile: apply same friction via touch (touchmove fires; wheel does not on mobile)
    // Decide capture once per gesture from touchstart target; do not re-check target on touchmove (finger moving over a link would otherwise flip between friction and native scroll).
    const handleTouchStart = (e: TouchEvent) => {
      if (!isCozy || e.touches.length !== 1) return
      const target = e.target as Element
      touchStartedOnInteractiveRef.current = !!target?.closest(TOUCH_CAPTURE_SKIP_SELECTOR)
      lastTouchYRef.current = e.touches[0].clientY
      touchScrollActiveRef.current = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isCozy || e.touches.length !== 1) return
      if (touchStartedOnInteractiveRef.current) return

      const currentY = e.touches[0].clientY
      const deltaY = lastTouchYRef.current - currentY // finger up = positive = scroll down
      lastTouchYRef.current = currentY

      if (!touchScrollActiveRef.current) {
        if (Math.abs(deltaY) < TOUCH_SCROLL_THRESHOLD) return
        touchScrollActiveRef.current = true
      }

      e.preventDefault()

      const frictionMultiplier = tracker.getFrictionMultiplier()
      const frictionFactor = baseFrictionFactor * frictionMultiplier
      const scrollDelta = deltaY * frictionFactor

      if (Math.abs(scrollDelta) < minScrollDistance) return

      window.scrollBy({
        top: scrollDelta,
        behavior: "auto",
      })

      tracker.recordScroll(window.scrollY || document.documentElement.scrollTop, Date.now())
    }

    const handleTouchEnd = () => {
      touchScrollActiveRef.current = false
    }

    const handleTouchCancel = () => {
      touchScrollActiveRef.current = false
    }

    // listen for dwell events from post cards
    const handleDwellStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ elementId: string; timestamp: number }>
      tracker.startDwell(customEvent.detail.elementId, customEvent.detail.timestamp)
    }

    const handleDwellEnd = (e: Event) => {
      const customEvent = e as CustomEvent<{ elementId: string; duration: number; timestamp: number }>
      tracker.endDwell(customEvent.detail.timestamp)
    }

    // check for fatigue and auto-switch to cozy mode
    const checkFatigue = () => {
      const now = Date.now()
      if (now - lastFatigueTriggerRef.current < cooldownPeriod) {
        return
      }

      if (tracker.detectFatigue() && !isCozy) {
        console.log("Fatigue detected - activating Cozy Mode")
        lastFatigueTriggerRef.current = now
        setMode("cozy")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true })
    window.addEventListener("dwellStart", handleDwellStart as EventListener)
    window.addEventListener("dwellEnd", handleDwellEnd as EventListener)

    checkIntervalRef.current = setInterval(checkFatigue, 500)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchCancel)
      window.removeEventListener("dwellStart", handleDwellStart)
      window.removeEventListener("dwellEnd", handleDwellEnd)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [isCozy, setMode])

  return trackerRef.current
}
