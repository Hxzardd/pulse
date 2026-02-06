"use client"

import { useEffect, useRef } from "react"
import { useMode } from "./mode-context"
import { KineticTracker } from "./kinetic-tracker"

// applies scroll friction in cozy mode and auto-detects fatigue
export function useScrollFriction() {
  const { mode, setMode } = useMode()
  const isCozy = mode === "cozy"
  const trackerRef = useRef<KineticTracker | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFatigueTriggerRef = useRef<number>(0)
  const cooldownPeriod = 10000 // 10s cooldown to prevent rapid toggling
  
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
    
    // apply friction in cozy mode
    const handleWheel = (e: WheelEvent) => {
      if (!isCozy) {
        handleScroll()
        return
      }
      
      e.preventDefault()
      
      // get dynamic friction based on fatigue
      const frictionMultiplier = tracker.getFrictionMultiplier()
      const frictionFactor = baseFrictionFactor * frictionMultiplier
      const scrollDelta = e.deltaY * frictionFactor
      
      if (Math.abs(scrollDelta) < minScrollDistance) {
        return
      }
      
      window.scrollBy({
        top: scrollDelta,
        behavior: "auto"
      })
      
      tracker.recordScroll(window.scrollY || document.documentElement.scrollTop, Date.now())
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
    window.addEventListener("dwellStart", handleDwellStart as EventListener)
    window.addEventListener("dwellEnd", handleDwellEnd as EventListener)
    
    checkIntervalRef.current = setInterval(checkFatigue, 500)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("dwellStart", handleDwellStart)
      window.removeEventListener("dwellEnd", handleDwellEnd)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [isCozy, setMode])
  
  return trackerRef.current
}
