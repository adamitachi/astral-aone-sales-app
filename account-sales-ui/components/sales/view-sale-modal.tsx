"use client"

import { X, DollarSign, Calendar, FileText, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Customer {
  id: number
  name: string
  email: string | null
  phoneNumber: string | null
}

interface Sale {
  id: number
  customerId: number
  amount: number
  saleDate: string
  description: string
  status?: string
  customer?: Customer
}

interface ViewSaleModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

export function ViewSaleModal({ isOpen, onClose, sale }: ViewSaleModalProps) {
  if (!isOpen || !sale) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Sale Details</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sale Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Sale #{sale.id}</h3>
              <p className="text-gray-600">{formatDate(sale.saleDate)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(sale.amount)}
              </div>
              {getStatusBadge(sale.status || 'completed')}
            </div>
          </div>

          {/* Sale Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Description</span>
            </div>
            <p className="text-gray-800">{sale.description}</p>
          </div>

          {/* Customer Information */}
          {sale.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {sale.customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{sale.customer.name}</h4>
                    <p className="text-sm text-gray-500">ID: {sale.customer.id}</p>
                  </div>
                </div>
                
                {sale.customer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{sale.customer.email}</span>
                  </div>
                )}
                
                {sale.customer.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{sale.customer.phoneNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sale Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                Sale Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sale ID:</span>
                <span className="font-medium">#{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(sale.saleDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-green-600">{formatCurrency(sale.amount)}</span>
              </div>
                               <div className="flex justify-between">
                   <span className="text-gray-600">Status:</span>
                   <span>{getStatusBadge(sale.status || 'completed')}</span>
                 </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
