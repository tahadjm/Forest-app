/**
 * Set the authentication token in both cookie and localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return

  // Set in localStorage for backward compatibility
  localStorage.setItem("authToken", token)

  // Set secure cookie (remove HttpOnly as it cannot be set from client-side)
  const secure = window.location.protocol === "https:"
  document.cookie = `Authorization=${token}; path=/; max-age=28800; SameSite=Strict${secure ? "; Secure" : ""}` // 8 hours
}

/**
 * Remove the authentication token from both cookie and localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return

  // Remove from localStorage
  localStorage.removeItem("authToken")
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  // Clear cookie - use only the standard name (remove HttpOnly)
  const secure = window.location.protocol === "https:"
  document.cookie = `Authorization=; path=/; max-age=0; SameSite=Strict${secure ? "; Secure" : ""}`
}

