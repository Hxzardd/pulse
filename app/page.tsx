"use client"

import { ModeProvider, useMode } from "@/components/pulse/mode-context"
import { Header } from "@/components/pulse/header"
import { StoriesBar } from "@/components/pulse/stories-bar"
import { Feed } from "@/components/pulse/feed"
import { BottomNav } from "@/components/pulse/bottom-nav"
import { useScrollFriction } from "@/components/pulse/scroll-friction"
import { cn } from "@/lib/utils"

function PulseApp() {
  const { mode } = useMode()
  const isCozy = mode === "cozy"
  
  // track scroll behavior and apply friction
  useScrollFriction()

  return (
    <div
      className={cn(
        "min-h-screen mode-transition",
        isCozy ? "bg-[var(--cozy-background)] cozy-mode" : "bg-background"
      )}
    >
      <Header />

      {/* Main content with proper spacing for fixed header/nav */}
      <main
        className={cn(
          "max-w-lg mx-auto mode-transition",
          isCozy ? "pt-[6.5rem]" : "pt-14",
          "pb-20"
        )}
      >
        <StoriesBar />
        <Feed />
      </main>

      <BottomNav />
    </div>
  )
}

export default function Page() {
  return (
    <ModeProvider>
      <PulseApp />
    </ModeProvider>
  )
}

