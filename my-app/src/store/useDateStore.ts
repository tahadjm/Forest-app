import { create } from "zustand"

interface DateState {
  date: Date | null
  setDate: (date: Date | null) => void
}

export const useDateStore = create<DateState>((set) => ({
  date: null,
  setDate: (date) => set({ date }),
}))
