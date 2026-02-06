"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// manages UI mode - normal (vibrant) vs cozy (muted, low-stimulation)

type Mode = "normal" | "cozy"

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("normal")

  const toggleMode = () => {
    setMode((prev) => (prev === "normal" ? "cozy" : "normal"))
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider")
  }
  return context
}

