"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '../ui/logo'
import { useProfile } from '@/contexts/profile-context'
import { useAuth } from '@/contexts/auth-context'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  PieChart,
  Target,
  Zap,
  Shield
} from 'lucide-react'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { profilePhoto } = useProfile()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, available: true },
    { name: 'Sales', href: '/sales', icon: TrendingUp, available: true },
    { name: 'Customers', href: '/customers', icon: Users, available: true },
    { name: 'Products', href: '/products', icon: ShoppingCart, available: true },
    { name: 'Invoices', href: '/invoices', icon: Receipt, available: true },
    { name: 'Payments', href: '#', icon: CreditCard, available: false, comingSoon: 'Available in Future' },
    { name: 'Reports', href: '#', icon: BarChart3, available: false, comingSoon: 'Available in Future' },
    { name: 'Analytics', href: '#', icon: PieChart, available: false, comingSoon: 'Available in Future' },
    { name: 'Goals', href: '#', icon: Target, available: false, comingSoon: 'Available in Future' },
    { name: 'Automation', href: '#', icon: Zap, available: false, comingSoon: 'Available in Future' },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: Shield, 
      available: user?.role?.toLowerCase() === 'admin',
      adminOnly: true 
    },
    { name: 'Settings', href: '/settings', icon: Settings, available: true },
  ]

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Logo size="lg" />
            <span className="text-xl font-bold text-gray-900">Astral Aone</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isAvailable = item.available
          
          if (isAvailable) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-700" : "text-gray-500"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          } else {
            return (
              <div
                key={item.name}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-60",
                  "text-gray-400"
                )}
                title={item.comingSoon}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                {!collapsed && (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">{item.name}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-gray-400 border-gray-300">
                        Soon
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-300 font-normal">{item.comingSoon}</span>
                  </div>
                )}
                {collapsed && (
                  <div className="relative" title={item.comingSoon}>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>
            )
          }
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="relative">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  title="Admin User"
                />
              ) : (
                <Logo size="sm" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="relative">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <Logo size="sm" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@astralaone.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
