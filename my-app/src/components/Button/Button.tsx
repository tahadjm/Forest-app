import type React from "react"
export const Button = ({ className = "", children }: { className?: string; children: React.ReactNode }) => {
  return (
    <button
      className={`shadow-[0_0_0_3px_#000000_inset] px-6 py-2 bg-orange-100 hover:bg-orange-200 text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 ${className}`}
    >
      {children}
    </button>
  )
}
