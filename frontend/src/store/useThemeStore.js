import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "light", 
  setTheme: (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme); 
    localStorage.setItem("chat-theme", newTheme); 
    set({ theme: newTheme }); 
  },
}));