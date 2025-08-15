"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { 
  ShoppingCart, 
  UserPlus, 
  CreditCard, 
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'sale',
    title: 'New sale completed',
    description: 'Product XYZ sold to John Doe',
    amount: 299.99,
    time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'completed'
  },
  {
    id: 2,
    type: 'customer',
    title: 'New customer registered',
    description: 'Jane Smith joined the platform',
    time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'completed'
  },
  {
    id: 3,
    type: 'payment',
    title: 'Payment received',
    description: 'Invoice #1234 paid by ABC Corp',
    amount: 1500.00,
    time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'completed'
  },
  {
    id: 4,
    type: 'invoice',
    title: 'Invoice generated',
    description: 'New invoice #1235 for Tech Solutions',
    amount: 2500.00,
    time: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'pending'
  },
  {
    id: 5,
    type: 'alert',
    title: 'Low stock alert',
    description: 'Product ABC is running low on inventory',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    status: 'warning'
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <ShoppingCart className="h-4 w-4 text-green-600" />
    case 'customer':
      return <UserPlus className="h-4 w-4 text-blue-600" />
    case 'payment':
      return <CreditCard className="h-4 w-4 text-purple-600" />
    case 'invoice':
      return <FileText className="h-4 w-4 text-orange-600" />
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <TrendingUp className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'warning':
      return <Badge variant="destructive">Warning</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-sm font-medium text-gray-900">
                        ${activity.amount.toFixed(2)}
                      </span>
                    )}
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateTime(activity.time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
