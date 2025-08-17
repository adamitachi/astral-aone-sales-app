"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { AdminGuard } from '@/components/auth/admin-guard'
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, Shield, AlertTriangle } from 'lucide-react'

interface PendingUser {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export default function AdminUsersPage() {
  const { addToast, ToastContainer } = useToast()
  const { user, token } = useAuth()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingUser, setProcessingUser] = useState<number | null>(null)

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (token && user) {
          if (user.role?.toLowerCase() !== 'admin') {
      addToast('Access denied. Admin privileges required.', 'error')
      router.push('/')
      return
    }
    } else if (token) {
      // User is logged in but no user data, fetch user info
      fetchUserInfo()
    } else {
      // No token, redirect to login
      router.push('/login')
      return
    }
  }, [token, user, router])

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
          addToast('Access denied. Admin privileges required.', 'error')
          router.push('/')
        }
      } else {
        addToast('Failed to verify user permissions', 'error')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      addToast('Failed to verify user permissions', 'error')
      router.push('/')
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/auth/pending-users')
      if (response.ok) {
        const users = await response.json()
        // Handle different data formats and ensure arrays
        const processedUsers = Array.isArray(users) ? users : 
          (users && users.$values && Array.isArray(users.$values)) ? users.$values : [];
        setPendingUsers(processedUsers)
      } else {
        addToast('Failed to fetch pending users', 'error')
        setPendingUsers([])
      }
    } catch (error) {
      console.error('Error fetching pending users:', error)
      addToast('Failed to fetch pending users', 'error')
      setPendingUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (userId: number, approve: boolean) => {
    setProcessingUser(userId)
    try {
      const response = await fetch('http://localhost:5086/api/auth/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          approve, 
          reason: !approve ? 'Rejected by administrator' : undefined 
        })
      })

      if (response.ok) {
        addToast(
          approve ? 'User approved successfully' : 'User rejected successfully', 
          'success'
        )
        // Remove the user from the pending list
        setPendingUsers(prev => Array.isArray(prev) ? prev.filter(user => user.id !== userId) : [])
      } else {
        const error = await response.text()
        addToast(error || 'Failed to process user approval', 'error')
      }
    } catch (error) {
      console.error('Error processing user approval:', error)
      addToast('Failed to process user approval', 'error')
    } finally {
      setProcessingUser(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // Show access denied if user is not admin
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. Admin privileges are required.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Approve or reject pending user registrations</p>
            <div className="flex items-center space-x-2 mt-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Admin Access Required</span>
            </div>
          </div>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(pendingUsers) ? pendingUsers.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Users waiting for approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending User Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(pendingUsers) || pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending users</h3>
              <p className="text-gray-600">All user registrations have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(pendingUsers) ? pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Role: {user.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveUser(user.id, false)}
                        disabled={processingUser === user.id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        {processingUser === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(user.id, true)}
                        disabled={processingUser === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingUser === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  No pending users available
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ToastContainer />
      </div>
    </AdminGuard>
  )
}
