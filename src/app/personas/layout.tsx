import React from "react"

export default function PersonasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="personas-layout">
      {children}
    </div>
  )
} 