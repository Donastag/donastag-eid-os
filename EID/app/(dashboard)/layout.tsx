'use client'

import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomConsole } from '@/components/layout/bottom-console'
import { CommandPalette } from '@/components/features/command-palette'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Command Palette */}
      <CommandPalette />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Main Layout Container */}
      <div className="flex w-full pt-16">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Workspace - children render here */}
          <div className="flex-1 flex overflow-hidden">
            {children}
          </div>

          {/* Bottom Console - always visible in dashboard */}
          <BottomConsole />
        </div>
      </div>
    </div>
  )
}
