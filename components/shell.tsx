// components/shell.tsx
import type React from "react"

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return <div className="shell-container p-4">{children}</div>
}
