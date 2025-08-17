"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Settings, User, LogOut, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '../ui/logo'
import { ProfileModal } from '../modals/profile-modal'
import { SettingsModal } from '../modals/settings-modal'
import { HelpModal } from '../modals/help-modal'
import { NotificationsDropdown } from '../dropdowns/notifications-dropdown'
import { useProfile } from '@/contexts/profile-context'
import { useNotifications } from '@/contexts/notifications-context'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const router = useRouter()
  const { profilePhoto } = useProfile()
  const { unreadCount } = useNotifications()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [searchTerm, setSearchTerm] = useState('')

  const handleSignOut = () => {
    // Show confirmation
    if (confirm('Are you sure you want to sign out?')) {
      logout()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navigate to search results or filter current page
      console.log('Searching for:', searchTerm)
      // You could implement global search here
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers, products, invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowHelpModal(true)}
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Button>
            <NotificationsDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2"
              title="User Menu"
            >
              <div className="relative">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <Logo size="sm" />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || 'Admin User'}
              </span>
            </Button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={() => {
                    setShowProfileModal(true)
                    setShowProfileMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    setShowSettingsModal(true)
                    setShowProfileMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
                <hr className="my-1" />
                <button 
                  onClick={() => {
                    setShowProfileMenu(false)
                    handleSignOut()
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
      />
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </header>
  )
}
