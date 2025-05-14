// Helper functions for video handling

/**
 * Formats a video URL to ensure it can be properly accessed with CORS
 * @param url The original video URL
 * @returns The formatted video URL
 */
export const formatVideoUrl = (url: string): string => {
  if (!url) return ""

  // If it's a YouTube or Vimeo URL, return as is
  if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
    return url
  }

  // If it's a local URL from our API server, ensure it has the proper protocol
  if (url.startsWith("/uploads/") || url.includes("localhost:8000/uploads/")) {
    // Extract the filename
    const filename = url.split("/").pop()
    // Return the full URL with proper protocol
    return `http://localhost:8000/uploads/${filename}`
  }

  return url
}

/**
 * Utility functions for handling video URLs and media types
 */

/**
 * Determines the type of media from a URL
 * @param url The URL to check
 * @returns The media type: 'video', 'youtube', 'vimeo', 'image', or 'unknown'
 */
export function getMediaType(url: string): string {
  if (!url) return "unknown"

  // Check for common video extensions
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv", ".flv", ".mkv"]
  const hasVideoExtension = videoExtensions.some((ext) => url.toLowerCase().includes(ext))

  // Check for image extensions
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
  const hasImageExtension = imageExtensions.some((ext) => url.toLowerCase().includes(ext))

  // Check for video hosting platforms
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
  const isVimeo = url.includes("vimeo.com")

  if (hasVideoExtension) return "video"
  if (isYouTube) return "youtube"
  if (isVimeo) return "vimeo"
  if (hasImageExtension) return "image"

  return "unknown"
}

/**
 * Extracts the YouTube video ID from a YouTube URL
 * @param url The YouTube URL
 * @returns The video ID or null if not found
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Extracts the Vimeo video ID from a Vimeo URL
 * @param url The Vimeo URL
 * @returns The video ID or null if not found
 */
export function getVimeoVideoId(url: string): string | null {
  if (!url) return null

  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/
  const match = url.match(regExp)
  return match ? match[3] : null
}

/**
 * Generates an embed URL for a video based on its source
 * @param url The original video URL
 * @returns An embed URL suitable for iframes
 */
export function getEmbedUrl(url: string): string {
  const mediaType = getMediaType(url)

  if (mediaType === "youtube") {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  if (mediaType === "vimeo") {
    const videoId = getVimeoVideoId(url)
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url
  }

  return url
}

/**
 * Checks if a URL is likely a video URL
 * @param url The URL to check
 * @returns True if the URL appears to be a video
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false

  const mediaType = getMediaType(url)
  return ["video", "youtube", "vimeo"].includes(mediaType)
}
