"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <Moon size={20} className="text-blue-400" />
      ) : (
        <Sun size={20} className="text-orange-500" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
