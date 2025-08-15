"use client"

import { useState } from 'react'
import { X, DollarSign, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AddSaleModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onAddSale: (sale: Omit<Sale, 'id'>) => void
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

interface Sale {
  id: number
  customerId: number
  amount: number
  saleDate: string
  description: string
}

export function AddSaleModal({ isOpen, onClose, customer, onAddSale }: AddSaleModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    saleDate: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSubmitting(true)

    try {
      await onAddSale({
        customerId: customer.id,
        amount: parseFloat(formData.amount),
        saleDate: new Date(formData.saleDate).toISOString(),
        description: formData.description
      })

      // Reset form and close modal
      setFormData({ amount: '', description: '', saleDate: new Date().toISOString().split('T')[0] })
      onClose()
    } catch (error) {
      console.error('Failed to add sale:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Add Sale for {customer.name}</CardTitle>
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
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter sale description"
                />
              </div>
            </div>

            <div>
              <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                disabled={isSubmitting || !formData.amount || !formData.description.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Sale'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
