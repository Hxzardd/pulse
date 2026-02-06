"use client"

import { Home, Search, PlusSquare, Film, User } from "lucide-react"
import { useMode } from "./mode-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: PlusSquare, label: "Create" },
  { icon: Film, label: "Reels" },
  { icon: User, label: "Profile" },
]

export function BottomNav() {
  const { mode } = useMode()
  const [activeIndex, setActiveIndex] = useState(0)
  const isCozy = mode === "cozy"

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 mode-transition",
        isCozy
          ? "bg-[var(--cozy-background)] border-t border-[var(--cozy-border)]"
          : "bg-background/80 backdrop-blur-xl border-t border-border"
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = index === activeIndex
          const isCreate = item.label === "Create"

          return (
            <button
              key={item.label}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl mode-transition",
                isCozy
                  ? isActive
                    ? "bg-[var(--cozy-muted)]"
                    : "hover:bg-[var(--cozy-muted)]"
                  : isActive
                    ? "bg-muted"
                    : "hover:bg-muted/50"
              )}
              aria-label={item.label}
            >
              {isCreate && !isCozy ? (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary via-accent to-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon
                  className={cn(
                    "w-6 h-6 mode-transition",
                    isCozy
                      ? isActive
                        ? "text-[var(--cozy-foreground)]"
                        : "text-[var(--cozy-muted-foreground)]"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                />
              )}
              {isActive && (
                <div
                  className={cn(
                    "w-1 h-1 rounded-full mt-1 mode-transition",
                    isCozy ? "bg-[var(--cozy-foreground)]" : "bg-primary"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

