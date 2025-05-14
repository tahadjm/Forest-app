"use client"

const Booknow = () => {
  return (
    <div className="flex justify-center mt-5">
      <button className="relative group overflow-hidden bg-slate-900 text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-all duration-500 hover:scale-105">
        <span className="absolute inset-0 bg-gradient-to-r from-blue-200 to-cyan-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
        <span className="relative z-10 flex items-center space-x-2">
          <span>Book Now</span>
          <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.75 8.75L14.25 12L10.75 15.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </button>
    </div>
  )
}

export default Booknow
