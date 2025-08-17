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

interface RecentActivityProps {
  sales?: any[]
}

export function RecentActivity({ sales = [] }: RecentActivityProps) {
  // Process sales data to create activity feed
  const processActivities = () => {
    if (!sales || sales.length === 0) {
      return [
        {
          id: 1,
          type: 'info',
          title: 'No recent activity',
          description: 'Start making sales to see activity here',
          time: new Date(),
          status: 'info'
        }
      ]
    }

    // Convert sales to activities
    const salesActivities = sales.slice(0, 5).map((sale, index) => ({
      id: `sale-${sale.id || index}`,
      type: 'sale',
      title: 'Sale completed',
      description: `Sale #${sale.id || index + 1} - ${sale.customer?.name || 'Customer'} - ${sale.description || 'Product sold'}`,
      amount: sale.amount || 0,
      time: new Date(sale.saleDate || sale.dateCreated || Date.now()),
      status: sale.status || 'completed'
    }))

    return salesActivities
  }

  const activities = processActivities()

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
      case 'info':
        return <TrendingUp className="h-4 w-4 text-gray-600" />
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
      case 'info':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Info</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

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
