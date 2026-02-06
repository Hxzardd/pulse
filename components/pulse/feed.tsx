"use client"

import { useMode } from "./mode-context"
import { PostCard } from "./post-card"
import { cn } from "@/lib/utils"

const posts = [
  {
    id: "1",
    author: {
      name: "Alex Rivera",
      username: "adventure_alex",
      avatar: "/images/travel-1.jpg",
      isLive: true,
    },
    image: "/images/travel-1.jpg",
    caption:
      "Golden hour in Santorini hits different ✨🌅 The views here are absolutely unreal! Who wants to join the next adventure? 🌍",
    likes: 12847,
    comments: 234,
    timeAgo: "2h",
  },
  {
    id: "2",
    author: {
      name: "Fiona Chen",
      username: "foodie_fiona",
      avatar: "/images/food-1.jpg",
      isLive: false,
    },
    image: "/images/food-1.jpg",
    caption:
      "This poke bowl just changed my life 🍣🥑 The freshest ingredients and that sesame dressing is to die for! Drop a 🔥 if you love poke!",
    likes: 8932,
    comments: 156,
    timeAgo: "4h",
  },
  {
    id: "3",
    author: {
      name: "Jake Martinez",
      username: "fit_jake",
      avatar: "/images/fitness-1.jpg",
      isLive: false,
    },
    image: "/images/fitness-1.jpg",
    caption:
      "Sunrise yoga session complete 🧘‍♂️🌅 There's something magical about starting your day with movement and mindfulness. What's your morning routine?",
    likes: 5621,
    comments: 89,
    timeAgo: "6h",
  },
  {
    id: "4",
    author: {
      name: "Emma Thompson",
      username: "emma_vibes",
      avatar: "/images/lifestyle-1.jpg",
      isLive: true,
    },
    image: "/images/lifestyle-1.jpg",
    caption:
      "Rooftop vibes with the best people 🎉✨ Nothing beats sunset parties with good music and even better company! Tag your squad!",
    likes: 15234,
    comments: 312,
    timeAgo: "8h",
  },
]

export function Feed() {
  const { mode } = useMode()
  const isCozy = mode === "cozy"

  return (
    <div
      className={cn(
        "mode-transition",
        isCozy ? "space-y-8 px-5 py-6" : "space-y-4 px-4 py-4"
      )}
    >
      {/* Cozy Mode Friction Overlay Indicator */}
      {isCozy && (
        <div className="text-center py-4 border-b border-[var(--cozy-border)] mb-4">
          <p className="text-sm text-[var(--cozy-muted-foreground)]">
            Scroll friction increased for mindful browsing
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          author={post.author}
          image={post.image}
          caption={post.caption}
          likes={post.likes}
          comments={post.comments}
          timeAgo={post.timeAgo}
        />
      ))}

      {/* End of feed indicator */}
      <div
        className={cn(
          "text-center py-8 mode-transition",
          isCozy ? "text-[var(--cozy-muted-foreground)]" : "text-muted-foreground"
        )}
      >
        {isCozy ? (
          <div className="space-y-2">
            <p className="text-lg">You're all caught up</p>
            <p className="text-sm opacity-70">
              Take a mindful break. You've seen all recent posts.
            </p>
          </div>
        ) : (
          <p className="text-sm">You're all caught up! Check back later for more content 🎉</p>
        )}
      </div>
    </div>
  )
}

