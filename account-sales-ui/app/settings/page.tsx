"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Key,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  MapPin,
  Download,
  Upload,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { useDashboard } from '@/contexts/dashboard-context'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  address: string
  city: string
  country: string
  timezone: string
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard: {
    showCharts: boolean
    showMetrics: boolean
    refreshInterval: number
  }
}

export default function SettingsPage() {
  const { addToast, ToastContainer } = useToast()
  const { theme, setTheme } = useTheme()
  const { token } = useAuth()
  const { updateSettings } = useDashboard()
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@astralaone.com',
    phone: '+1 (555) 123-4567',
    company: 'Astral Aone',
    position: 'Administrator',
    address: '123 Business Street',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    timezone: 'Asia/Kuala_Lumpur'
  })

  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      showCharts: true,
      showMetrics: true,
      refreshInterval: 30
    }
  })

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isSettingsSaving, setIsSettingsSaving] = useState(false)
  const [isPasswordChanging, setIsPasswordChanging] = useState(false)

  // Load saved settings on component mount
  useEffect(() => {
    loadSavedSettings()
  }, [])

  const loadSavedSettings = () => {
    try {
      // Load profile
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }

      // Load app settings
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        setAppSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }

  const handleProfileUpdate = async () => {
    setIsProfileSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local storage or make API call here
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      addToast('Profile updated successfully!', 'success')
    } catch (error) {
      addToast('Failed to update profile', 'error')
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setIsSettingsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local storage or make API call here
      localStorage.setItem('appSettings', JSON.stringify(appSettings))
      
      addToast('Settings updated successfully!', 'success')
    } catch (error) {
      addToast('Failed to update settings', 'error')
    } finally {
      setIsSettingsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error')
      return
    }

    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'error')
      return
    }

    // Basic password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      addToast('Password must contain uppercase, lowercase, numbers, and special characters', 'error')
      return
    }

    if (!token) {
      addToast('Authentication required. Please log in again.', 'error')
      return
    }

    setIsPasswordChanging(true)
    try {
      const response = await fetch('http://localhost:5086/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        addToast('Password changed successfully!', 'success')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }))
        addToast(errorData.message || 'Failed to change password', 'error')
      }
    } catch (error) {
      console.error('Password change error:', error)
      addToast('Network error. Please try again.', 'error')
    } finally {
      setIsPasswordChanging(false)
    }
  }

  const exportSettings = () => {
    try {
      const settingsData = {
        profile,
        appSettings,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `astral-aone-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      addToast('Settings exported successfully!', 'success')
    } catch (error) {
      addToast('Failed to export settings', 'error')
    }
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settingsData = JSON.parse(e.target?.result as string)
        
        if (settingsData.profile) {
          setProfile(settingsData.profile)
        }
        if (settingsData.appSettings) {
          setAppSettings(settingsData.appSettings)
        }
        
        addToast('Settings imported successfully!', 'success')
      } catch (error) {
        addToast('Invalid settings file format', 'error')
      }
    }
    reader.readAsText(file)
  }

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
             setProfile({
         firstName: 'Admin',
         lastName: 'User',
         email: 'admin@astralaone.com',
         phone: '+1 (555) 123-4567',
         company: 'Astral Aone',
         position: 'Administrator',
         address: '123 Business Street',
         city: 'Kuala Lumpur',
         country: 'Malaysia',
         timezone: 'Asia/Kuala_Lumpur'
       })
      
      setAppSettings({
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          showCharts: true,
          showMetrics: true,
          refreshInterval: 30
        }
      })
      
      localStorage.removeItem('userProfile')
      localStorage.removeItem('appSettings')
      
      addToast('Settings reset to defaults!', 'success')
    }
  }

  const updateNotificationSetting = (type: keyof typeof appSettings.notifications, value: boolean) => {
    setAppSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }))
  }

  const updateDashboardSetting = (type: keyof typeof appSettings.dashboard, value: boolean | number) => {
    setAppSettings(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [type]: value
      }
    }))
    
    // Also update the dashboard context immediately
    updateSettings({ [type]: value })
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
    return strength
  }

  // Update password strength when new password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }, [newPassword])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and app settings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={resetToDefaults} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Profile</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Notifications</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Appearance</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Security</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Regional</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={profile.country} onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="Malaysia">Malaysia</SelectItem>
                       <SelectItem value="United States">United States</SelectItem>
                       <SelectItem value="Canada">Canada</SelectItem>
                       <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                       <SelectItem value="Germany">Germany</SelectItem>
                       <SelectItem value="France">France</SelectItem>
                       <SelectItem value="Australia">Australia</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="Asia/Kuala_Lumpur">Kuala Lumpur (GMT+8)</SelectItem>
                       <SelectItem value="America/New_York">Eastern Time</SelectItem>
                       <SelectItem value="America/Chicago">Central Time</SelectItem>
                       <SelectItem value="America/Denver">Mountain Time</SelectItem>
                       <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                       <SelectItem value="Europe/London">London</SelectItem>
                       <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate} 
                disabled={isProfileSaving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isProfileSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

                     {/* App Settings */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <Palette className="h-5 w-5" />
                 <span>App Preferences</span>
               </CardTitle>
               <p className="text-sm text-gray-600 mt-1">Customize how your application looks and behaves</p>
             </CardHeader>
             <CardContent className="space-y-6">
               {/* Theme and Language */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <Label htmlFor="theme">Theme</Label>
                   <p className="text-xs text-gray-500 mb-2">Automatically matches your system's light/dark mode preference</p>
                   <Select value="system" disabled>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="system">System (Recommended)</SelectItem>
                     </SelectContent>
                   </Select>
                   <p className="text-xs text-gray-400 mt-1">Light and Dark themes will be available in future updates</p>
                 </div>
                 <div>
                   <Label htmlFor="language">Language</Label>
                   <p className="text-xs text-gray-500 mb-2">Interface language for the application</p>
                   <Select value="en" disabled>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="en">English</SelectItem>
                     </SelectContent>
                   </Select>
                   <p className="text-xs text-gray-400 mt-1">Additional languages will be available in future updates</p>
                 </div>
               </div>

              <Separator />

                             {/* Notifications */}
               <div>
                 <h4 className="font-medium mb-3">Notification Preferences</h4>
                 <p className="text-sm text-gray-600 mb-3">Control how and when you receive notifications from the application</p>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Mail className="h-4 w-4 text-gray-600" />
                       <div>
                         <span className="font-medium">Email Notifications</span>
                         <p className="text-xs text-gray-500">Receive important updates and alerts via email</p>
                       </div>
                     </div>
                     <Switch
                       checked={appSettings.notifications.email}
                       onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Bell className="h-4 w-4 text-gray-600" />
                       <div>
                         <span className="font-medium">Push Notifications</span>
                         <p className="text-xs text-gray-500">Get real-time alerts while using the application</p>
                       </div>
                     </div>
                     <Switch
                       checked={appSettings.notifications.push}
                       onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <Phone className="h-4 w-4 text-gray-600" />
                       <div>
                         <span className="font-medium">SMS Notifications</span>
                         <p className="text-xs text-gray-500">Receive critical alerts via text message</p>
                       </div>
                     </div>
                     <Switch
                       checked={appSettings.notifications.sms}
                       onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
                     />
                   </div>
                 </div>
               </div>

              <Separator />

                             {/* Dashboard Settings */}
               <div>
                 <h4 className="font-medium mb-3">Dashboard Preferences</h4>
                 <p className="text-sm text-gray-600 mb-3">Customize what information is displayed on your main dashboard</p>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <span className="font-medium">Show Charts</span>
                       <p className="text-xs text-gray-500">Display visual charts and graphs for data analysis</p>
                     </div>
                     <Switch
                       checked={appSettings.dashboard.showCharts}
                       onCheckedChange={(checked) => updateDashboardSetting('showCharts', checked)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>
                       <span className="font-medium">Show Metrics</span>
                       <p className="text-xs text-gray-500">Display key performance indicators and statistics</p>
                     </div>
                     <Switch
                       checked={appSettings.dashboard.showMetrics}
                       onCheckedChange={(checked) => updateDashboardSetting('showMetrics', checked)}
                     />
                   </div>
                   <div>
                     <Label htmlFor="refreshInterval">Auto-refresh Interval</Label>
                     <p className="text-xs text-gray-500 mb-2">How often the dashboard automatically updates with new data</p>
                     <Select value={appSettings.dashboard.refreshInterval.toString()} onValueChange={(value) => updateDashboardSetting('refreshInterval', parseInt(value))}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="15">15 seconds</SelectItem>
                         <SelectItem value="30">30 seconds</SelectItem>
                         <SelectItem value="60">1 minute</SelectItem>
                         <SelectItem value="300">5 minutes</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               </div>

              <Button 
                onClick={handleSettingsUpdate} 
                disabled={isSettingsSaving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSettingsSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                                 <div>
                   <Label htmlFor="newPassword">New Password</Label>
                   <div className="relative">
                     <Input
                       id="newPassword"
                       type={showPasswords ? 'text' : 'password'}
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                     />
                   </div>
                   {newPassword && (
                     <div className="mt-2">
                       <div className="flex items-center space-x-2 mb-1">
                         <span className="text-sm text-gray-600">Password strength:</span>
                         <div className="flex space-x-1">
                           {[1, 2, 3, 4, 5].map((level) => (
                             <div
                               key={level}
                               className={`h-2 w-8 rounded-full ${
                                 level <= passwordStrength
                                   ? passwordStrength >= 4
                                     ? 'bg-green-500'
                                     : passwordStrength >= 3
                                     ? 'bg-yellow-500'
                                     : 'bg-red-500'
                                   : 'bg-gray-200'
                               }`}
                             />
                           ))}
                         </div>
                         <span className={`text-sm font-medium ${
                           passwordStrength >= 4 ? 'text-green-600' :
                           passwordStrength >= 3 ? 'text-yellow-600' :
                           'text-red-600'
                         }`}>
                           {passwordStrength >= 4 ? 'Strong' :
                            passwordStrength >= 3 ? 'Medium' :
                            passwordStrength >= 2 ? 'Weak' : 'Very Weak'}
                         </span>
                       </div>
                     </div>
                   )}
                 </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

                             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                 <h5 className="font-medium text-blue-900 mb-2">Password Requirements</h5>
                 <ul className="text-sm text-blue-800 space-y-1">
                   <li className={`flex items-center space-x-2 ${newPassword.length >= 8 ? 'text-green-700' : ''}`}>
                     <span>•</span>
                     <span>At least 8 characters long</span>
                     {newPassword.length >= 8 && <span className="text-green-600">✓</span>}
                   </li>
                   <li className={`flex items-center space-x-2 ${/[A-Z]/.test(newPassword) ? 'text-green-700' : ''}`}>
                     <span>•</span>
                     <span>Contains uppercase and lowercase letters</span>
                     {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && <span className="text-green-600">✓</span>}
                   </li>
                   <li className={`flex items-center space-x-2 ${/\d/.test(newPassword) ? 'text-green-700' : ''}`}>
                     <span>•</span>
                     <span>Contains at least one number</span>
                     {/\d/.test(newPassword) && <span className="text-green-600">✓</span>}
                   </li>
                   <li className={`flex items-center space-x-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-700' : ''}`}>
                     <span>•</span>
                     <span>Contains at least one special character</span>
                     {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && <span className="text-green-600">✓</span>}
                   </li>
                 </ul>
               </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={isPasswordChanging || !currentPassword || !newPassword || !confirmPassword}
                className="w-full md:w-auto"
              >
                <Key className="h-4 w-4 mr-2" />
                {isPasswordChanging ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">App Version:</span>
                  <Badge variant="outline" className="ml-2">v1.0.0</Badge>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Database Status:</span>
                  <Badge className="ml-2 bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div>
                  <span className="text-gray-600">Backend Status:</span>
                  <Badge className="ml-2 bg-green-100 text-green-800">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
