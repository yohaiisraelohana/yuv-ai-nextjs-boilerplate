"use client"

import * as React from "react"
import { useAccessibility } from "@/context/AccessibilityContext"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useAccessibility()
  
  const handleToggle = () => {
    console.log("Theme toggle button clicked, current darkMode:", darkMode);
    toggleDarkMode();
  }
  
  React.useEffect(() => {
    console.log("ThemeToggle rendered with darkMode:", darkMode);
  }, [darkMode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative overflow-hidden rounded-full w-10 h-10 bg-transparent hover:bg-muted focus-visible:ring-purple-500"
      aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun className="h-5 w-5 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon className="h-5 w-5 text-purple-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
} 