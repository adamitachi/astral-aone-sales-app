"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ProfileContextType {
  profilePhoto: string | null
  setProfilePhoto: (photo: string | null) => void
  refreshProfilePhoto: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)

  // Load profile photo from localStorage on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profile-photo')
    if (savedPhoto) {
      setProfilePhotoState(savedPhoto)
    }
    
    // Listen for storage changes to update profile photo across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile-photo') {
        setProfilePhotoState(e.newValue)
      }
    }
    
    // Listen for custom events to update profile photo within the same tab
    const handleProfileUpdate = () => {
      const savedPhoto = localStorage.getItem('profile-photo')
      setProfilePhotoState(savedPhoto)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profile-photo-updated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profile-photo-updated', handleProfileUpdate)
    }
  }, [])

  const setProfilePhoto = (photo: string | null) => {
    setProfilePhotoState(photo)
    if (photo) {
      localStorage.setItem('profile-photo', photo)
    } else {
      localStorage.removeItem('profile-photo')
    }
    
    // Dispatch custom event to notify other components in the same tab
    window.dispatchEvent(new CustomEvent('profile-photo-updated'))
  }

  const refreshProfilePhoto = () => {
    const savedPhoto = localStorage.getItem('profile-photo')
    setProfilePhotoState(savedPhoto)
  }

  return (
    <ProfileContext.Provider value={{ 
      profilePhoto, 
      setProfilePhoto, 
      refreshProfilePhoto 
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
