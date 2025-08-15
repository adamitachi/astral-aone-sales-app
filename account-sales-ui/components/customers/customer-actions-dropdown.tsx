"use client"

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Archive, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerActionsDropdownProps {
  customer: Customer
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onAddSale: (customer: Customer) => void
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

export function CustomerActionsDropdown({ customer, onView, onEdit, onDelete, onAddSale }: CustomerActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => handleAction(() => onView(customer))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-3" />
            View Details
          </button>
          
          <button
            onClick={() => handleAction(() => onEdit(customer))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-3" />
            Edit Customer
          </button>

          <button
            onClick={() => handleAction(() => onAddSale(customer))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <DollarSign className="h-4 w-4 mr-3" />
            Add Sale
          </button>

          <button
            onClick={() => handleAction(() => copyToClipboard(customer.email || ''))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4 mr-3" />
            Copy Email
          </button>

          <button
            onClick={() => handleAction(() => copyToClipboard(customer.phoneNumber || ''))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4 mr-3" />
            Copy Phone
          </button>

          <hr className="my-1" />

          <button
            onClick={() => handleAction(() => onDelete(customer))}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete Customer
          </button>
        </div>
      )}
    </div>
  )
}
