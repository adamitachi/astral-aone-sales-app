"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (userData: any) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const session = localStorage.getItem('user-session')
      if (!session) {
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(session)
      if (!userData.token || !userData.user) {
        localStorage.removeItem('user-session')
        setIsLoading(false)
        return
      }

      // Verify token with backend
      try {
        const response = await fetch('http://localhost:5086/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData.token)
        })

        if (response.ok) {
          const verifiedUser = await response.json()
          setUser(verifiedUser)
          setToken(userData.token)
        } else {
          localStorage.removeItem('user-session')
          setUser(null)
          setToken(null)
        }
      } catch (networkError) {
        // If backend is down, still allow login with cached session
        console.warn('Backend verification failed, using cached session:', networkError)
        setUser(userData.user)
        setToken(userData.token)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('user-session')
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (userData: any) => {
    console.log('Login called with:', userData)
    setUser(userData.user)
    setToken(userData.token)
    localStorage.setItem('user-session', JSON.stringify(userData))
    console.log('User set:', userData.user)
    console.log('Token set:', userData.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user-session')
    router.push('/login')
  }

  const isAuthenticated = !!user && !!token && user.status === 'approved'
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth State:', {
      pathname,
      isPublicRoute,
      isLoading,
      user: user ? { id: user.id, name: user.name, status: user.status } : null,
      hasToken: !!token,
      isAuthenticated
    })
  }

  // Handle redirects in useEffect to avoid rendering during state updates
  useEffect(() => {
    if (!isLoading && user !== null) { // Only redirect when we have a definitive auth state
      if (!isPublicRoute && !isAuthenticated) {
        console.log('Redirecting to login - not authenticated on protected route')
        router.push('/login')
      } else if (isPublicRoute && isAuthenticated) {
        console.log('Redirecting to dashboard - authenticated on public route')
        router.push('/')
      }
    }
  }, [isLoading, isPublicRoute, isAuthenticated, router, user])

  // Don't render anything while checking auth - let AppLayout handle the loading state
  if (isLoading) {
    return null
  }

  // For protected routes, don't render if not authenticated (redirect will happen in useEffect)
  if (!isPublicRoute && !isAuthenticated) {
    return null
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
