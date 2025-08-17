"use client"

import { X, User, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface ViewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

interface Customer {
  id: number
  name: string
  email: string | null
  phoneNumber: string | null
  dateCreated: string
  status?: 'active' | 'inactive' | 'prospect'
  totalSpent?: number
}

export function ViewCustomerModal({ isOpen, onClose, customer }: ViewCustomerModalProps) {
  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Customer Details</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xl">
                {customer.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">ID: {customer.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            {customer.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.email}</span>
              </div>
            )}
            
            {customer.phoneNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.phoneNumber}</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">Joined: {formatDate(customer.dateCreated)}</span>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                Total Spent: ${customer.totalSpent?.toLocaleString() || '0'}
              </span>
            </div>

            {/* Sales History */}
            {customer.sales && Array.isArray(customer.sales) && customer.sales.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sales History</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {customer.sales.map((sale: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium text-gray-900">{sale.description}</span>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-medium text-green-600">
                        ${sale.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
