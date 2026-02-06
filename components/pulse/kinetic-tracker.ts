// Tracks scroll velocity and dwell time to detect doom-scrolling
// Implements the Attention-Density Ratio algorithm from the patent

export interface KineticFrame {
  timestamp: number
  scrollPosition: number
  velocity: number // px/s
  acceleration: number // px/s²
}

export interface DwellData {
  elementId: string
  startTime: number
  endTime: number | null
  duration: number // ms
}

export class KineticTracker {
  private frames: KineticFrame[] = []
  private readonly bufferSize = 30 // keep last 30 frames
  private readonly windowSize = 3000 // 3 second window
  
  // thresholds for fatigue detection - tuned to avoid false positives
  private readonly velocityThreshold = 1500 // px/s - peak velocity
  private readonly avgVelocityThreshold = 1200 // px/s - average over window
  private readonly minDwellTime = 500 // 0.5s minimum to count as engagement
  private readonly minSustainedFrames = 5 // need at least 5 frames
  private readonly frictionMultiplier = 1.5 // increase friction when fatigued
  
  private lastScrollPosition = 0
  private lastTimestamp = 0
  private currentDwell: DwellData | null = null
  private dwellTimes: DwellData[] = []
  
  // record scroll position and calculate velocity
  recordScroll(scrollPosition: number, timestamp: number = Date.now()): void {
    const deltaTime = timestamp - this.lastTimestamp
    if (deltaTime === 0) return
    
    const deltaPosition = scrollPosition - this.lastScrollPosition
    const velocity = (deltaPosition / deltaTime) * 1000 // px/s
    const acceleration = this.calculateAcceleration(velocity, timestamp)
    
    const frame: KineticFrame = {
      timestamp,
      scrollPosition,
      velocity: Math.abs(velocity),
      acceleration: Math.abs(acceleration),
    }
    
    // circular buffer - keep last 30 frames
    this.frames.push(frame)
    if (this.frames.length > this.bufferSize) {
      this.frames.shift()
    }
    
    this.lastScrollPosition = scrollPosition
    this.lastTimestamp = timestamp
  }
  
  // calculate acceleration from velocity change
  private calculateAcceleration(currentVelocity: number, timestamp: number): number {
    if (this.frames.length === 0) return 0
    
    const lastFrame = this.frames[this.frames.length - 1]
    const deltaTime = (timestamp - lastFrame.timestamp) / 1000
    if (deltaTime === 0) return 0
    
    const deltaVelocity = Math.abs(currentVelocity) - lastFrame.velocity
    return deltaVelocity / deltaTime
  }
  
  // start tracking when post enters viewport
  startDwell(elementId: string, timestamp: number = Date.now()): void {
    if (this.currentDwell) {
      this.endDwell(timestamp)
    }
    
    this.currentDwell = {
      elementId,
      startTime: timestamp,
      endTime: null,
      duration: 0,
    }
  }
  
  // stop tracking when post leaves viewport
  endDwell(timestamp: number = Date.now()): void {
    if (!this.currentDwell) return
    
    this.currentDwell.endTime = timestamp
    this.currentDwell.duration = timestamp - this.currentDwell.startTime
    
    this.dwellTimes.push({ ...this.currentDwell })
    
    // only keep recent dwell times (3 second window)
    const cutoff = timestamp - this.windowSize
    this.dwellTimes = this.dwellTimes.filter(d => d.startTime > cutoff)
    
    this.currentDwell = null
  }
  
  // ρ_a = V(t) / D_i (velocity / average dwell time)
  calculateAttentionDensityRatio(): number {
    if (this.frames.length === 0) return 0
    
    const currentVelocity = this.frames[this.frames.length - 1].velocity
    const cutoff = Date.now() - this.windowSize
    const recentDwells = this.dwellTimes.filter(d => d.startTime > cutoff)
    
    if (recentDwells.length === 0) {
      return currentVelocity / this.minDwellTime
    }
    
    const avgDwellTime = recentDwells.reduce((sum, d) => sum + d.duration, 0) / recentDwells.length
    
    if (avgDwellTime === 0) {
      return currentVelocity / this.minDwellTime
    }
    
    const avgDwellSeconds = avgDwellTime / 1000
    return currentVelocity / avgDwellSeconds
  }
  
  // check if user is doom-scrolling
  // requires sustained high velocity + low dwell times
  detectFatigue(): boolean {
    if (this.frames.length < this.minSustainedFrames) {
      return false
    }
    
    const cutoff = Date.now() - this.windowSize
    const recentFrames = this.frames.filter(f => f.timestamp > cutoff)
    
    if (recentFrames.length < this.minSustainedFrames) {
      return false
    }
    
    // check average velocity
    const avgVelocity = recentFrames.reduce((sum, f) => sum + f.velocity, 0) / recentFrames.length
    if (avgVelocity < this.avgVelocityThreshold) {
      return false
    }
    
    // need at least 60% of frames to be high velocity (sustained, not spikes)
    const highVelocityFrames = recentFrames.filter(f => f.velocity > this.velocityThreshold).length
    const sustainedRatio = highVelocityFrames / recentFrames.length
    if (sustainedRatio < 0.6) {
      return false
    }
    
    // check dwell times
    const recentDwells = this.dwellTimes.filter(d => d.startTime > cutoff)
    
    if (recentDwells.length === 0) {
      // no dwell data + sustained high velocity = likely fatigue
      return recentFrames.length >= 10 && avgVelocity > this.avgVelocityThreshold * 1.2
    }
    
    const avgDwellTime = recentDwells.reduce((sum, d) => sum + d.duration, 0) / recentDwells.length
    return avgDwellTime < this.minDwellTime
  }
  
  getFrictionMultiplier(): number {
    if (this.detectFatigue()) {
      return this.frictionMultiplier
    }
    return 1.0
  }
  
  getAverageVelocity(): number {
    if (this.frames.length === 0) return 0
    
    const cutoff = Date.now() - this.windowSize
    const recentFrames = this.frames.filter(f => f.timestamp > cutoff)
    
    if (recentFrames.length === 0) return 0
    
    return recentFrames.reduce((sum, f) => sum + f.velocity, 0) / recentFrames.length
  }
  
  reset(): void {
    this.frames = []
    this.dwellTimes = []
    this.currentDwell = null
    this.lastScrollPosition = 0
    this.lastTimestamp = Date.now()
  }
}

