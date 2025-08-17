"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DashboardSettings {
  showCharts: boolean
  showMetrics: boolean
  refreshInterval: number
}

interface DashboardContextType {
  settings: DashboardSettings
  updateSettings: (newSettings: Partial<DashboardSettings>) => void
  refreshData: () => void
  lastRefresh: Date
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DashboardSettings>({
    showCharts: true,
    showMetrics: true,
    refreshInterval: 30
  })
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Load saved dashboard settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (parsed.dashboard) {
          setSettings(parsed.dashboard)
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard settings:', error)
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (settings.refreshInterval <= 0) return

    const interval = setInterval(() => {
      refreshData()
    }, settings.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [settings.refreshInterval])

  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Save to localStorage
    try {
      const savedSettings = localStorage.getItem('appSettings')
      const parsed = savedSettings ? JSON.parse(savedSettings) : {}
      parsed.dashboard = updatedSettings
      localStorage.setItem('appSettings', JSON.stringify(parsed))
    } catch (error) {
      console.error('Failed to save dashboard settings:', error)
    }
  }

  const refreshData = () => {
    setLastRefresh(new Date())
    // This will trigger a re-render of components that depend on lastRefresh
  }

  return (
    <DashboardContext.Provider value={{
      settings,
      updateSettings,
      refreshData,
      lastRefresh
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
