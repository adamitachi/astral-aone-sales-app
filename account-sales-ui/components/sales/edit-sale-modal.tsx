"use client"

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

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

interface EditSaleModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  customers: Customer[]
  onUpdateSale: (id: number, saleData: Partial<Sale>) => void
}

export function EditSaleModal({ isOpen, onClose, sale, customers, onUpdateSale }: EditSaleModalProps) {
  const { addToast, ToastContainer } = useToast()
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    description: '',
    saleDate: '',
    status: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when sale changes
  useEffect(() => {
    if (sale) {
      setFormData({
        customerId: sale.customerId.toString(),
        amount: sale.amount.toString(),
        description: sale.description,
        saleDate: sale.saleDate.split('T')[0],
        status: sale.status || 'completed'
      })
    }
  }, [sale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sale) return

    setIsSubmitting(true)
    try {
      await onUpdateSale(sale.id, {
        customerId: parseInt(formData.customerId),
        amount: parseFloat(formData.amount),
        description: formData.description,
        saleDate: new Date(formData.saleDate).toISOString(),
        status: formData.status
      })
      
      addToast('Sale updated successfully!', 'success')
      onClose()
    } catch (error) {
      console.error('Failed to update sale:', error)
      addToast('Failed to update sale', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !sale) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Edit Sale #{sale.id}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
              <Label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleInputChange('customerId', value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(customers) ? customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.email || 'No email'}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sale Amount */}
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={3}
                  className="pl-10"
                  placeholder="Enter sale description"
                />
              </div>
            </div>

            {/* Sale Date */}
            <div>
              <Label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={(e) => handleInputChange('saleDate', e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !formData.customerId || !formData.amount || !formData.description.trim()}
              >
                {isSubmitting ? 'Updating...' : 'Update Sale'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  )
}
