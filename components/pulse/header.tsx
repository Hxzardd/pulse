"use client"

import { Bell, MessageSquare, Sparkles, Moon } from "lucide-react"
import { useMode } from "./mode-context"
import { cn } from "@/lib/utils"

export function Header() {
  const { mode, toggleMode } = useMode()
  const isCozy = mode === "cozy"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 mode-transition",
        isCozy
          ? "bg-[var(--cozy-background)] border-b border-[var(--cozy-border)]"
          : "bg-background/80 backdrop-blur-xl border-b border-border"
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center mode-transition",
              isCozy
                ? "bg-[var(--cozy-muted)]"
                : "bg-gradient-to-br from-primary to-secondary"
            )}
          >
            <Sparkles
              className={cn(
                "w-5 h-5 mode-transition",
                isCozy ? "text-[var(--cozy-muted-foreground)]" : "text-white"
              )}
            />
          </div>
          <span
            className={cn(
              "font-bold text-xl tracking-tight mode-transition",
              isCozy
                ? "text-[var(--cozy-foreground)]"
                : "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            )}
          >
            Pulse
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mode Toggle */}
          <button
            onClick={toggleMode}
            className={cn(
              "relative p-2 rounded-full mode-transition",
              isCozy
                ? "bg-[var(--cozy-primary)] text-[var(--cozy-primary-foreground)]"
                : "bg-gradient-to-r from-primary to-secondary text-white"
            )}
            aria-label={isCozy ? "Switch to Normal Mode" : "Switch to Cozy Mode"}
          >
            {isCozy ? <Sparkles className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button
            className={cn(
              "relative p-2 rounded-full mode-transition",
              isCozy
                ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Bell className="w-5 h-5" />
            {!isCozy && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Messages */}
          <button
            className={cn(
              "relative p-2 rounded-full mode-transition",
              isCozy
                ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                : "text-foreground hover:bg-muted"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            {!isCozy && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cozy Mode Indicator */}
      {isCozy && (
        <div className="bg-[var(--cozy-muted)] border-t border-[var(--cozy-border)] py-2 px-4 mode-transition">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-sm text-[var(--cozy-muted-foreground)]">
            <span className="opacity-60">✦</span>
            <span>Mindful Scroll Active</span>
            <span className="opacity-60">✦</span>
          </div>
        </div>
      )}
    </header>
  )
}

