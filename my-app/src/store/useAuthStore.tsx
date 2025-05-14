// "use client"

// import { create } from "zustand"
// import { persist } from "zustand/middleware"

// interface AuthState {
//   isAuthenticated: boolean
//   user: {
//     id?: string
//     name?: string
//     email?: string
//   } | null
//   token: string | null
//   tokenExpiry: number | null

//   // Auth actions
//   setAuthenticated: (isAuthenticated: boolean) => void
//   setUser: (user: AuthState["user"]) => void
//   setToken: (token: string, expiryInSeconds?: number) => void
//   logout: () => void

//   // Payment related
//   lastPaymentId: string | null
//   setLastPaymentId: (id: string | null) => void
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       isAuthenticated: false,
//       user: null,
//       token: null,
//       tokenExpiry: null,
//       lastPaymentId: null,

//       setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
//       setUser: (user) => set({ user }),
//       setToken: (token, expiryInSeconds) =>
//         set({
//           token,
//           tokenExpiry: expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null,
//         }),
//       logout: () =>
//         set({
//           isAuthenticated: false,
//           user: null,
//           token: null,
//           tokenExpiry: null,
//         }),
//       setLastPaymentId: (id) => set({ lastPaymentId: id }),
//     }),
//     {
//       name: "auth-storage",
//       // Only persist non-sensitive data
//       partialize: (state) => ({
//         isAuthenticated: state.isAuthenticated,
//         user: { id: state.user?.id, name: state.user?.name },
//         tokenExpiry: state.tokenExpiry,
//         lastPaymentId: state.lastPaymentId,
//       }),
//     },
//   ),
// )
