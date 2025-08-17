"use client"

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

interface NewSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSale: (sale: Omit<Sale, 'id'>) => void
}

export function NewSaleModal({ isOpen, onClose, onAddSale }: NewSaleModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    saleDate: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')

  // Fallback customers for when backend is not available
  const fallbackCustomers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1-555-0123',
      dateCreated: '2024-01-15T10:00:00Z',
      status: 'active',
      totalSpent: 1250.00
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1-555-0124',
      dateCreated: '2024-01-14T14:30:00Z',
      status: 'active',
      totalSpent: 850.00
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phoneNumber: '+1-555-0125',
      dateCreated: '2024-01-13T09:15:00Z',
      status: 'active',
      totalSpent: 432.00
    }
  ]

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
    }
  }, [isOpen])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      // Handle different data formats and ensure arrays
      const processedCustomers = Array.isArray(data) ? data : 
        (data && data.$values && Array.isArray(data.$values)) ? data.$values : [];
      setCustomers(processedCustomers)
      setBackendStatus('connected')
    } catch (error) {
      console.error('Backend connection failed:', error)
      setCustomers(fallbackCustomers)
      setBackendStatus('disconnected')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) return

    setIsSubmitting(true)

    try {
      await onAddSale({
        customerId: selectedCustomerId,
        amount: parseFloat(formData.amount),
        saleDate: new Date(formData.saleDate).toISOString(),
        description: formData.description
      })

      // Reset form and close modal
      setFormData({ amount: '', description: '', saleDate: new Date().toISOString().split('T')[0] })
      setSelectedCustomerId(null)
      onClose()
    } catch (error) {
      console.error('Failed to add sale:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'customerId') {
      setSelectedCustomerId(Number(value))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const selectedCustomer = Array.isArray(customers) ? customers.find(c => c.id === selectedCustomerId) : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Create New Sale</CardTitle>
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
          {backendStatus === 'disconnected' && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Offline Mode:</strong> Using fallback data. Backend connection unavailable.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="customerId"
                  name="customerId"
                  value={selectedCustomerId || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a customer...</option>
                  {Array.isArray(customers) ? customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email || 'No email'}
                    </option>
                  )) : (
                    <option value="" disabled>No customers available</option>
                  )}
                </select>
              </div>
              {selectedCustomer && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{selectedCustomer.name}</strong>
                    {selectedCustomer.email && <> • {selectedCustomer.email}</>}
                    {selectedCustomer.phoneNumber && <> • {selectedCustomer.phoneNumber}</>}
                    {selectedCustomer.totalSpent !== undefined && (
                      <> • Total Spent: ${selectedCustomer.totalSpent.toFixed(2)}</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Sale Amount */}
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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

            {/* Sale Date */}
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
                disabled={isSubmitting || !selectedCustomerId || !formData.amount || !formData.description.trim()}
              >
                {isSubmitting ? 'Creating...' : 'Create Sale'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewSaleModal