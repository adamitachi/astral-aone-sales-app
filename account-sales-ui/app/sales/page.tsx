"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import NewSaleModal from '@/components/sales/new-sale-modal'
import { ViewSaleModal } from '@/components/sales/view-sale-modal'
import { EditSaleModal } from '@/components/sales/edit-sale-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'

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
  status?: string
  customer?: Customer
}

// Fallback sales data when backend is not available
const fallbackSalesData: Sale[] = [
  {
    id: 1,
    customerId: 1,
    amount: 299.99,
    saleDate: '2024-01-15T10:00:00Z',
    description: 'Product A - Premium Package'
  },
  {
    id: 2,
    customerId: 2,
    amount: 450.00,
    saleDate: '2024-01-14T14:30:00Z',
    description: 'Product B - Enterprise Solution'
  },
  {
    id: 3,
    customerId: 3,
    amount: 199.99,
    saleDate: '2024-01-13T09:15:00Z',
    description: 'Product C - Basic Package'
  },
  {
    id: 4,
    customerId: 1,
    amount: 299.99,
    saleDate: '2024-01-12T16:45:00Z',
    description: 'Product A - Additional License'
  },
  {
    id: 5,
    customerId: 2,
    amount: 599.99,
    saleDate: '2024-01-11T11:20:00Z',
    description: 'Product D - Premium Support'
  }
]

const monthlyStats = [
  { month: 'Jan', sales: 12500, target: 10000, growth: 25 },
  { month: 'Feb', sales: 11800, target: 10000, growth: 18 },
  { month: 'Mar', sales: 13200, target: 10000, growth: 32 },
  { month: 'Apr', sales: 14100, target: 10000, growth: 41 },
  { month: 'May', sales: 12800, target: 10000, growth: 28 },
  { month: 'Jun', sales: 13500, target: 10000, growth: 35 }
]

export default function SalesPage() {
  const { addToast, ToastContainer } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false)
  const [isViewSaleModalOpen, setIsViewSaleModalOpen] = useState(false)
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; saleId: number | null }>({ isOpen: false, saleId: null })

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 Starting to fetch sales data...')
      try {
        // Fetch sales and customers in parallel
        console.log('📡 Fetching from: http://localhost:5086/api/sales')
        
        // Get auth token from localStorage
        const token = localStorage.getItem('authToken')
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const [salesResponse, customersResponse] = await Promise.all([
          fetch('http://localhost:5086/api/sales', { headers }),
          fetch('http://localhost:5086/api/customers', { headers })
        ])

        console.log('📊 Sales response status:', salesResponse.status)
        console.log('👥 Customers response status:', customersResponse.status)

        if (!salesResponse.ok || !customersResponse.ok) {
          throw new Error(`Failed to fetch data - Sales: ${salesResponse.status}, Customers: ${customersResponse.status}`)
        }

        const [salesData, customersData] = await Promise.all([
          salesResponse.json(),
          customersResponse.json()
        ])

        console.log('📈 Raw sales data:', salesData)
        console.log('👥 Raw customers data:', customersData)

        // Handle different data formats and ensure arrays
        const processedSalesData = Array.isArray(salesData) ? salesData : 
          (salesData && salesData.$values && Array.isArray(salesData.$values)) ? salesData.$values : [];
        
        const processedCustomersData = Array.isArray(customersData) ? customersData : 
          (customersData && customersData.$values && Array.isArray(customersData.$values)) ? customersData.$values : [];

        console.log('✅ Processed sales data:', processedSalesData)
        console.log('✅ Processed customers data:', processedCustomersData)

        // Create a customer lookup for enriching sales data
        const customerLookup = processedCustomersData.reduce((acc: any, customer: Customer) => {
          acc[customer.id] = customer
          return acc
        }, {})

        // Enrich sales data with customer information
        const enrichedSales = processedSalesData.map((sale: Sale) => ({
          ...sale,
          customer: customerLookup[sale.customerId]
        }))

        console.log('🎯 Final enriched sales:', enrichedSales)

        setSalesData(enrichedSales)
        setCustomers(processedCustomersData)
        setBackendStatus('connected')
        console.log('✅ Data fetching completed successfully')
      } catch (error) {
        console.error('❌ Backend connection failed:', error)
        console.log('🔄 Falling back to demo data...')
        setSalesData(fallbackSalesData)
        setBackendStatus('disconnected')
      } finally {
        setIsLoading(false)
        console.log('🏁 Loading state set to false')
      }
    }

    fetchData()
  }, [])

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setIsViewSaleModalOpen(true)
  }

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale)
    setIsEditSaleModalOpen(true)
  }

  const handleDeleteSale = (id: number) => {
    setDeleteConfirmation({ isOpen: true, saleId: id })
  }

  const confirmDeleteSale = async () => {
    const saleId = deleteConfirmation.saleId
    if (!saleId) return

    try {
      if (backendStatus === 'connected') {
        // Try to delete sale from backend
        const response = await fetch(`http://localhost:5086/api/sales/${saleId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setSalesData(prev => prev.filter(sale => sale.id !== saleId))
          addToast('Sale deleted successfully!', 'success')
        } else {
          throw new Error('Failed to delete sale')
        }
      } else {
        // Remove from local state when backend is not available
        setSalesData(prev => prev.filter(sale => sale.id !== saleId))
        addToast('Sale deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to delete sale:', error)
      addToast('Failed to delete sale', 'error')
    } finally {
      setDeleteConfirmation({ isOpen: false, saleId: null })
    }
  }

  const handleUpdateSale = async (id: number, saleData: Partial<Sale>) => {
    try {
      if (backendStatus === 'connected') {
        // Try to update sale in backend
        const response = await fetch(`http://localhost:5086/api/sales/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData),
        })

        if (response.ok) {
          const updatedSale = await response.json()
          // Find the customer for this sale
          const customer = customers.find(c => c.id === saleData.customerId)
          const enrichedSale = { ...updatedSale, customer }
          
          setSalesData(prev => prev.map(sale => 
            sale.id === id ? enrichedSale : sale
          ))
          addToast('Sale updated successfully!', 'success')
        } else {
          throw new Error('Failed to update sale')
        }
      } else {
        // Update in local state when backend is not available
        const updatedSale = { ...saleData, id }
        const customer = customers.find(c => c.id === saleData.customerId)
        const enrichedSale = { ...updatedSale, customer }
        
        setSalesData(prev => prev.map(sale => 
          sale.id === id ? enrichedSale : sale
        ))
        addToast('Sale updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to update sale:', error)
      addToast('Failed to update sale', 'error')
    }
  }

  const handleNewSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      if (backendStatus === 'connected') {
        // Try to add sale to backend
        const response = await fetch('http://localhost:5086/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData),
        })

        if (response.ok) {
          const newSale = await response.json()
          // Find the customer for this sale
          const customer = customers.find(c => c.id === saleData.customerId)
          const enrichedSale = { ...newSale, customer }
          
          setSalesData(prev => [enrichedSale, ...prev])
          addToast('Sale created successfully!', 'success')
        } else {
          throw new Error('Failed to create sale')
        }
      } else {
        // Add to local state when backend is not available
        const newSale: Sale = {
          id: Array.isArray(salesData) && salesData.length > 0 ? Math.max(...salesData.map(s => s.id), 0) + 1 : 1,
          ...saleData
        }
        
        setSalesData(prev => [newSale, ...prev])
        addToast('Sale created successfully!', 'success')
      }
    } catch (error) {
      console.error('Failed to create sale:', error)
      addToast('Failed to create sale', 'error')
    }
  }

  const handleExport = async () => {
    try {
      if (backendStatus === 'connected') {
        // Use server-side export when backend is available
        const response = await fetch('http://localhost:5086/api/sales/export')
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.setAttribute('href', url)
          link.setAttribute('download', `sales-export-${new Date().toISOString().split('T')[0]}.csv`)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          addToast('Sales data exported successfully!', 'success')
        } else {
          throw new Error('Server export failed')
        }
      } else {
        // Fall back to client-side export when backend is not available
        const headers = ['Sale ID', 'Customer', 'Amount', 'Description', 'Date', 'Customer Email']
        const csvContent = [
          headers.join(','),
          ...(Array.isArray(salesData) ? salesData.map(sale => [
            sale.id,
            `"${sale.customer?.name || 'Unknown Customer'}"`,
            sale.amount,
            `"${sale.description}"`,
            new Date(sale.saleDate).toLocaleDateString(),
            `"${sale.customer?.email || 'No email'}"`
          ].join(',')) : [])
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', `sales-export-${new Date().toISOString().split('T')[0]}.csv`)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          addToast('Sales data exported successfully!', 'success')
        }
      }
    } catch (error) {
      console.error('Failed to export sales data:', error)
      addToast('Failed to export sales data', 'error')
    }
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

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 State changed - salesData:', salesData)
    console.log('🔄 State changed - customers:', customers)
    console.log('🔄 State changed - isLoading:', isLoading)
    console.log('🔄 State changed - backendStatus:', backendStatus)
  }, [salesData, customers, isLoading, backendStatus])

  console.log('🔄 Current state - salesData:', salesData)
  console.log('🔄 Current state - customers:', customers)
  console.log('🔄 Current state - isLoading:', isLoading)
  console.log('🔄 Current state - backendStatus:', backendStatus)
  
  // Calculate metrics with debugging
  const totalSales = Array.isArray(salesData) ? salesData.reduce((sum, sale) => sum + sale.amount, 0) : 0
  const completedSales = Array.isArray(salesData) ? salesData.filter(sale => sale.status === 'completed').length : 0
  const conversionRate = Array.isArray(salesData) && salesData.length > 0 ? (completedSales / salesData.length) * 100 : 0
  
  console.log('📊 Metrics calculation:')
  console.log('  - salesData array:', Array.isArray(salesData))
  console.log('  - salesData length:', Array.isArray(salesData) ? salesData.length : 'N/A')
  console.log('  - totalSales:', totalSales)
  console.log('  - completedSales:', completedSales)
  console.log('  - conversionRate:', conversionRate)

  return (
    <div className="p-6 space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Backend Status: {backendStatus}</div>
          <div>Sales Data Count: {Array.isArray(salesData) ? salesData.length : 'Not an array'}</div>
          <div>Customers Count: {Array.isArray(customers) ? customers.length : 'Not an array'}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport} disabled={!Array.isArray(salesData) || salesData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsNewSaleModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Count
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(salesData) ? salesData.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Performance</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-blue-500" />
              <p>Sales chart will be displayed here</p>
              <p className="text-sm">Monthly data: {monthlyStats.length} months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading sales data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sale ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                                 <tbody>
                   {(() => {
                     console.log('🎯 Table rendering check:')
                     console.log('  - salesData:', salesData)
                     console.log('  - Array.isArray(salesData):', Array.isArray(salesData))
                     console.log('  - salesData.length:', Array.isArray(salesData) ? salesData.length : 'N/A')
                     
                     if (Array.isArray(salesData) && salesData.length > 0) {
                       return salesData.map((sale) => (
                       <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">#{sale.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{sale.customer?.name || 'Unknown Customer'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{sale.description}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{formatCurrency(sale.amount)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(sale.status || 'completed')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{sale.customer?.email || 'No email'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSale(sale)}
                          title="View Sale"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSale(sale)}
                          title="Edit Sale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                          title="Delete Sale"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                                         </td>
                   </tr>
                       ))
                     } else {
                       return (
                         <tr>
                           <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                             No sales data available
                           </td>
                         </tr>
                       )
                     }
                   })()}
                 </tbody>
               </table>
             </div>
           )}
        </CardContent>
      </Card>

      {/* Backend Status Alert */}
      {backendStatus === 'disconnected' && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h4 className="font-medium text-yellow-800">Offline Mode</h4>
          <p className="text-sm text-yellow-700">
            Backend connection unavailable. Using fallback data. Some features may be limited.
          </p>
        </div>
      )}

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onAddSale={handleNewSale}
      />

      {/* View Sale Modal */}
      <ViewSaleModal
        isOpen={isViewSaleModalOpen}
        onClose={() => {
          setIsViewSaleModalOpen(false)
          setSelectedSale(null)
        }}
        sale={selectedSale}
      />

      {/* Edit Sale Modal */}
      <EditSaleModal
        isOpen={isEditSaleModalOpen}
        onClose={() => {
          setIsEditSaleModalOpen(false)
          setSelectedSale(null)
        }}
        sale={selectedSale}
        customers={customers}
        onUpdateSale={handleUpdateSale}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, saleId: null })}
        onConfirm={confirmDeleteSale}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
