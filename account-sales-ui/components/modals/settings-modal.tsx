"use client"

import { useState } from 'react'
import { X, Monitor, Moon, Sun, Bell, Mail, Shield, Database, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'ms' | 'zh'

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    theme: 'light' as Theme,
    language: 'en' as Language,
    notifications: {
      email: true,
      push: true,
      sales: true,
      customers: false,
      reports: true
    },
    privacy: {
      analytics: true,
      dataSharing: false,
      autoLogout: 30
    },
    display: {
      compactMode: false,
      showSidebar: true,
      itemsPerPage: 10
    }
  })

  const handleSave = () => {
    // Here you would typically save to localStorage or send to backend
    localStorage.setItem('app-settings', JSON.stringify(settings))
    onClose()
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'system', icon: Monitor, label: 'System' }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('theme', '', value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                          settings.theme === value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', '', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="ms">Bahasa Melayu</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Compact Mode</span>
                    <button
                      onClick={() => updateSetting('display', 'compactMode', !settings.display.compactMode)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.display.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.display.compactMode ? 'translate-x-6' : 'translate-x-1'
                        } mt-1`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Show Sidebar</span>
                    <button
                      onClick={() => updateSetting('display', 'showSidebar', !settings.display.showSidebar)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.display.showSidebar ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.display.showSidebar ? 'translate-x-6' : 'translate-x-1'
                        } mt-1`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', icon: Mail },
                  { key: 'push', label: 'Push Notifications', icon: Bell },
                  { key: 'sales', label: 'Sales Updates', icon: Bell },
                  { key: 'customers', label: 'Customer Updates', icon: Bell },
                  { key: 'reports', label: 'Report Generation', icon: Bell }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', key, !settings.notifications[key as keyof typeof settings.notifications])}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.notifications[key as keyof typeof settings.notifications] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                        } mt-1`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Analytics Collection</span>
                  <button
                    onClick={() => updateSetting('privacy', 'analytics', !settings.privacy.analytics)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.privacy.analytics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Data Sharing</span>
                  <button
                    onClick={() => updateSetting('privacy', 'dataSharing', !settings.privacy.dataSharing)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                      } mt-1`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Logout (minutes)</label>
                  <select
                    value={settings.privacy.autoLogout}
                    onChange={(e) => updateSetting('privacy', 'autoLogout', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Data & Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data & Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items per page</label>
                  <select
                    value={settings.display.itemsPerPage}
                    onChange={(e) => updateSetting('display', 'itemsPerPage', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={5}>5 items</option>
                    <option value={10}>10 items</option>
                    <option value={25}>25 items</option>
                    <option value={50}>50 items</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
