"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Notification {
  id: string
  type: 'sale' | 'customer' | 'system' | 'reminder'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New Sale Created',
    message: 'Sale of $2,500 created for Acme Corporation',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false
  },
  {
    id: '2',
    type: 'customer',
    title: 'New Customer Added',
    message: 'TechStart Inc has been added to your customer list',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false
  },
  {
    id: '3',
    type: 'system',
    title: 'Data Backup Completed',
    message: 'Your daily data backup has been completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: true
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Monthly Report Due',
    message: 'Your monthly sales report is due in 2 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    read: true
  },
  {
    id: '5',
    type: 'sale',
    title: 'Payment Received',
    message: 'Payment of $1,200 received from Global Solutions',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true
  }
]

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Convert timestamp strings back to Date objects
          return parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
        } catch (error) {
          console.error('Error parsing saved notifications:', error)
        }
      }
    }
    return initialNotifications
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      addNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
