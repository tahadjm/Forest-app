"use client"

import { motion } from "framer-motion"

const LoadingButton = ({ text, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.span
        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, ease: "linear" }}
      />
      <span>{text}</span>
    </div>
  )
}

export default LoadingButton
