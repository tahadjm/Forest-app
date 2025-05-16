"use client"

import { useAuth as useAuthContext } from "@/context/auth-context"

// This hook serves as a bridge between the auth context and components
export const useAuth = () => {
  return useAuthContext()
}

export default useAuth
