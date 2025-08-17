"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/login')
        return
      }

      if (user && user.role?.toLowerCase() !== 'admin') {
        setIsChecking(false)
        return
      }

      if (token && !user) {
        // Fetch user info to check role
        fetchUserInfo()
      } else {
        setIsChecking(false)
      }
    }
  }, [token, user, isLoading, router])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.role?.toLowerCase() !== 'admin') {
          setIsChecking(false)
          return
        }
      } else {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      router.push('/login')
      return
    }
    
    setIsChecking(false)
  }

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Verifying admin privileges...</p>
        </div>
      </div>
    )
  }

  // Show access denied if user is not admin
  if (!user || user.role?.toLowerCase() !== 'admin') {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Shield className="h-12 w-12 text-red-500" />
                <AlertTriangle className="h-6 w-6 text-red-600 absolute -top-1 -right-1" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              This page requires administrator privileges. Only users with the Admin role can access this section.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                Return to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')} className="w-full">
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is admin, render children
  return <>{children}</>
}
