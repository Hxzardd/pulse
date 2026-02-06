"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { useMode } from "./mode-context"
import { cn } from "@/lib/utils"

const stories = [
  { id: "you", name: "Your story", avatar: "/images/lifestyle-1.jpg", isUser: true },
  { id: "1", name: "adventure_alex", avatar: "/images/travel-1.jpg", hasLive: true },
  { id: "2", name: "foodie_fiona", avatar: "/images/food-1.jpg", hasNew: true },
  { id: "3", name: "fit_jake", avatar: "/images/fitness-1.jpg", hasNew: true },
  { id: "4", name: "travel_emma", avatar: "/images/travel-1.jpg", hasNew: true },
  { id: "5", name: "chef_marco", avatar: "/images/food-1.jpg", hasLive: true },
]

export function StoriesBar() {
  const { mode } = useMode()
  const isCozy = mode === "cozy"

  return (
    <div
      className={cn(
        "overflow-x-auto scrollbar-hide mode-transition",
        isCozy
          ? "bg-[var(--cozy-background)] border-b border-[var(--cozy-border)] py-5"
          : "bg-background py-4"
      )}
    >
      <div className={cn("flex gap-4 px-4", isCozy && "gap-5 px-5")}>
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex flex-col items-center gap-1.5 min-w-[68px]"
          >
            <div className="relative">
              {/* Ring gradient - Normal mode only */}
              {!isCozy && (story.hasNew || story.hasLive) && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full p-[2px]",
                    story.hasLive
                      ? "bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500 animate-pulse"
                      : "bg-gradient-to-tr from-primary via-accent to-secondary"
                  )}
                >
                  <div className="w-full h-full rounded-full bg-background" />
                </div>
              )}
              
              {/* Cozy mode ring */}
              {isCozy && (
                <div className="absolute inset-0 rounded-full p-[2px] bg-[var(--cozy-border)]">
                  <div className="w-full h-full rounded-full bg-[var(--cozy-background)]" />
                </div>
              )}

              {/* Avatar */}
              <div
                className={cn(
                  "relative w-16 h-16 rounded-full overflow-hidden",
                  (story.hasNew || story.hasLive) && !isCozy && "m-[3px]",
                  isCozy && "m-[3px]"
                )}
              >
                <Image
                  src={story.avatar || "/placeholder.svg"}
                  alt={story.name}
                  fill
                  className="object-cover preserve-color"
                />
              </div>

              {/* Add button for user story */}
              {story.isUser && (
                <div
                  className={cn(
                    "absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 mode-transition",
                    isCozy
                      ? "bg-[var(--cozy-muted)] border-[var(--cozy-background)] text-[var(--cozy-muted-foreground)]"
                      : "bg-secondary border-background text-white"
                  )}
                >
                  <Plus className="w-3 h-3" />
                </div>
              )}

              {/* Live badge */}
              {story.hasLive && !isCozy && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  LIVE
                </div>
              )}
            </div>
            <span
              className={cn(
                "text-xs truncate max-w-[68px] mode-transition",
                isCozy ? "text-[var(--cozy-muted-foreground)]" : "text-muted-foreground"
              )}
            >
              {story.isUser ? "Your story" : story.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

