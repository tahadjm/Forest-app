"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { getMediaType, getYouTubeVideoId, getVimeoVideoId } from "@/utils/video-helper"

interface VideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mediaType, setMediaType] = useState<string>("unknown")

  useEffect(() => {
    // Determine media type
    setMediaType(getMediaType(src))
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set up video event listeners
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setIsMuted(video.muted)

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("volumechange", handleVolumeChange)

    // Clean up event listeners
    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Render YouTube embed
  if (mediaType === "youtube") {
    const videoId = getYouTubeVideoId(src)
    if (!videoId) return null

    const youtubeParams = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      controls: controls ? "1" : "0",
      rel: "0",
      modestbranding: "1",
    })

    return (
      <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?${youtubeParams.toString()}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    )
  }

  // Render Vimeo embed
  if (mediaType === "vimeo") {
    const videoId = getVimeoVideoId(src)
    if (!videoId) return null

    const vimeoParams = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      muted: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      controls: controls ? "1" : "0",
    })

    return (
      <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?${vimeoParams.toString()}`}
          title="Vimeo video player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    )
  }

  // Render native video player
  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />

      {controls && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
