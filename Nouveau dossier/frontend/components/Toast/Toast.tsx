"use client"

import { toast } from "react-hot-toast"

export const showToast = (message: string, type: "success" | "error" = "success") => {
  if (type === "success") {
    toast.success(message)
  } else {
    toast.error(message)
  }
}
