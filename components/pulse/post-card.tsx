"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import { useMode } from "./mode-context"
import { cn } from "@/lib/utils"

// tracks how long user spends viewing each post for fatigue detection

interface PostCardProps {
  author: {
    name: string
    username: string
    avatar: string
    isLive?: boolean
  }
  image: string
  caption: string
  likes: number
  comments: number
  timeAgo: string
  postId?: string
}

export function PostCard({ author, image, caption, likes, comments, timeAgo, postId }: PostCardProps) {
  const { mode } = useMode()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const cardRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const dwellStartRef = useRef<number | null>(null)

  const isCozy = mode === "cozy"

  // track dwell time when post enters/leaves viewport
  useEffect(() => {
    if (!cardRef.current || !postId) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dwellStartRef.current = Date.now()
            window.dispatchEvent(
              new CustomEvent("dwellStart", {
                detail: { elementId: postId, timestamp: Date.now() },
              })
            )
          } else if (dwellStartRef.current) {
            const dwellDuration = Date.now() - dwellStartRef.current
            window.dispatchEvent(
              new CustomEvent("dwellEnd", {
                detail: {
                  elementId: postId,
                  duration: dwellDuration,
                  timestamp: Date.now(),
                },
              })
            )
            dwellStartRef.current = null
          }
        })
      },
      { threshold: 0.5 }
    )

    observerRef.current.observe(cardRef.current)

    return () => {
      if (observerRef.current && cardRef.current) {
        observerRef.current.unobserve(cardRef.current)
      }
    }
  }, [postId])

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <article
      ref={cardRef}
      className={cn(
        "mode-transition rounded-2xl overflow-hidden",
        isCozy
          ? "bg-[var(--cozy-card)] border border-[var(--cozy-border)]"
          : "bg-card border border-border"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between p-4", isCozy && "px-5 py-5")}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full overflow-hidden ring-2 mode-transition",
                isCozy ? "ring-[var(--cozy-border)]" : "ring-primary"
              )}
            >
              <Image
                src={author.avatar || "/placeholder.svg"}
                alt={author.name}
                width={40}
                height={40}
                className="object-cover preserve-color"
              />
            </div>
            {author.isLive && !isCozy && (
              <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            )}
            {isCozy && (
              <span className="absolute -bottom-1 -right-1 bg-[var(--cozy-muted)] text-[var(--cozy-muted-foreground)] text-[10px] px-1.5 py-0.5 rounded-full">
                ✦
              </span>
            )}
          </div>
          <div>
            <p
              className={cn(
                "font-semibold text-sm mode-transition",
                isCozy ? "text-[var(--cozy-foreground)]" : "text-foreground"
              )}
            >
              {author.name}
            </p>
            <p
              className={cn(
                "text-xs mode-transition",
                isCozy ? "text-[var(--cozy-muted-foreground)]" : "text-muted-foreground"
              )}
            >
              @{author.username} · {timeAgo}
            </p>
          </div>
        </div>
        <button
          className={cn(
            "p-2 rounded-full mode-transition",
            isCozy
              ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square">
        <Image 
          src={image || "/placeholder.svg"} 
          alt={caption} 
          fill 
          sizes="(max-width: 768px) 100vw, 512px"
          className="object-cover" 
        />
        {isCozy && (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cozy-background)]/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Actions */}
      <div className={cn("p-4 space-y-3", isCozy && "px-5 py-5 space-y-4")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-full mode-transition",
                isCozy
                  ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                  : liked
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
              )}
            >
              <Heart
                className={cn("w-6 h-6 mode-transition", liked && !isCozy && "fill-primary")}
              />
            </button>
            <button
              className={cn(
                "p-2 rounded-full mode-transition",
                isCozy
                  ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                  : "text-foreground hover:text-secondary"
              )}
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              className={cn(
                "p-2 rounded-full mode-transition",
                isCozy
                  ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                  : "text-foreground hover:text-secondary"
              )}
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={cn(
              "p-2 rounded-full mode-transition",
              isCozy
                ? "text-[var(--cozy-muted-foreground)] hover:bg-[var(--cozy-muted)]"
                : saved
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
            )}
          >
            <Bookmark className={cn("w-6 h-6", saved && !isCozy && "fill-accent")} />
          </button>
        </div>

        {/* Like/Share Buttons - Normal Mode has vibrant buttons */}
        {!isCozy && (
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-semibold text-sm mode-transition",
                liked
                  ? "bg-primary text-primary-foreground"
                  : "bg-gradient-to-r from-primary to-pink-500 text-primary-foreground hover:opacity-90"
              )}
            >
              {liked ? "Liked" : "Like"} · {likeCount.toLocaleString()}
            </button>
            <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-secondary to-blue-400 text-secondary-foreground hover:opacity-90 mode-transition">
              Share
            </button>
          </div>
        )}

        {/* Cozy Mode - Muted, subtle buttons */}
        {isCozy && (
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              className="flex-1 py-3 rounded-xl font-medium text-sm bg-[var(--cozy-muted)] text-[var(--cozy-muted-foreground)] mode-transition"
            >
              {liked ? "Liked" : "Like"} · {likeCount.toLocaleString()}
            </button>
            <button className="flex-1 py-3 rounded-xl font-medium text-sm bg-[var(--cozy-muted)] text-[var(--cozy-muted-foreground)] mode-transition">
              Share
            </button>
          </div>
        )}

        {/* Caption */}
        <p
          className={cn(
            "text-sm leading-relaxed mode-transition",
            isCozy ? "text-[var(--cozy-card-foreground)]" : "text-card-foreground"
          )}
        >
          <span className="font-semibold">{author.username}</span> {caption}
        </p>

        {/* Comments preview */}
        <button
          className={cn(
            "text-sm mode-transition",
            isCozy ? "text-[var(--cozy-muted-foreground)]" : "text-muted-foreground"
          )}
        >
          View all {comments} comments
        </button>
      </div>
    </article>
  )
}

