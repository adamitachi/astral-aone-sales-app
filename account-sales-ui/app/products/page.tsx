"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Edit,
  Eye,
  Trash2,
  Download,
  Upload,
  Settings,
  Wrench,
  RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { AddItemModal } from '@/components/products/add-item-modal'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [productsData, setProductsData] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  
  const { token } = useAuth()
  const { toast } = useToast()

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:5086/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and $values format
        const products = Array.isArray(data) ? data : (data.$values || [])
        setProductsData(products)
        setBackendStatus('online')
        
        // Extract unique categories and types
        const uniqueCategories = [...new Set(products.map((p: any) => p.category).filter(Boolean))]
        const uniqueTypes = [...new Set(products.map((p: any) => p.type).filter(Boolean))]
        
        setCategories(['All', ...uniqueCategories.sort()])
        setTypes(uniqueTypes.sort())
      } else {
        console.error('Failed to fetch products:', response.status)
        setBackendStatus('offline')
        toast({
          title: "Error",
          description: "Failed to fetch products from backend",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setBackendStatus('offline')
      toast({
        title: "Error",
        description: "Failed to connect to backend",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/products/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const categories = Array.isArray(data) ? data : (data.$values || [])
        setCategories(['All', ...categories.sort()])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch types
  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/products/types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const types = Array.isArray(data) ? data : (data.$values || [])
        setTypes(types.sort())
      }
    } catch (error) {
      console.error('Error fetching types:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (token) {
      fetchProducts()
      fetchCategories()
      fetchTypes()
    }
  }, [token])

  // Handle item added
  const handleItemAdded = () => {
    fetchProducts() // Refresh the products list
    fetchCategories() // Refresh categories
    fetchTypes() // Refresh types
  }

  const filteredProducts = Array.isArray(productsData) ? productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  }) : []

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'discontinued':
        return <Badge variant="destructive">Discontinued</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStockStatus = (stock: number, minStock: number, isService: boolean) => {
    if (isService) return 'text-blue-600'
    if (stock === 0) return 'text-red-600'
    if (stock <= minStock) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStockText = (stock: number, minStock: number, isService: boolean) => {
    if (isService) return 'Service'
    if (stock === 0) return 'Out of Stock'
    if (stock <= minStock) return 'Low Stock'
    return `${stock} in stock`
  }

  const totalProducts = Array.isArray(productsData) ? productsData.length : 0
  const totalServices = Array.isArray(productsData) ? productsData.filter(p => p.isService).length : 0
  const totalPhysicalProducts = Array.isArray(productsData) ? productsData.filter(p => !p.isService).length : 0
  const totalValue = Array.isArray(productsData) ? productsData.reduce((sum, product) => {
    if (product.isService) {
      return sum + product.price // Services don't have stock, just price
    }
    return sum + (product.price * product.stock)
  }, 0) : 0
  const lowStockProducts = Array.isArray(productsData) ? productsData.filter(product => !product.isService && product.stock <= product.minStock && product.stock > 0).length : 0
  const outOfStockProducts = Array.isArray(productsData) ? productsData.filter(product => !product.isService && product.stock === 0).length : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog, services, and inventory</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-gray-500">
              {backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? 'Backend Offline' : 'Checking Backend...'}
            </span>
            {isLoading && (
              <span className="text-xs text-blue-500">Loading...</span>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchProducts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddItemModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{totalPhysicalProducts} products</span> + <span className="text-purple-600">{totalServices} services</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">Products</span> + <span className="text-purple-600">Services</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">Physical products only</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">Physical products only</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.isArray(categories) ? categories.map(category => (
                <option key={category} value={category}>{category}</option>
              )) : null}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                if (e.target.value === 'All') {
                  setSelectedCategory('All')
                } else {
                  setSelectedCategory(e.target.value)
                }
              }}
            >
              <option value="All">All Types</option>
              {Array.isArray(types) ? types.map(type => (
                <option key={type} value={type}>{type}</option>
              )) : null}
            </select>
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                List
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading products and services...</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <img
                      src={product.imageUrl || product.image || 'https://via.placeholder.com/60x60'}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(product.status)}
                      <Badge variant="outline" className={`text-xs ${product.isService ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                        {product.isService ? 'Service' : 'Product'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`text-sm font-medium ${getStockStatus(product.stock, product.minStock, product.isService)}`}>
                      {getStockText(product.stock, product.minStock, product.isService)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No items available
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading products and services...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Items List ({Array.isArray(filteredProducts) ? filteredProducts.length : 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Stock/Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{product.sku}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={`text-xs ${product.isService ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                          {product.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{product.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{formatCurrency(product.cost)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`font-medium ${getStockStatus(product.stock, product.minStock, product.isService)}`}>
                            {getStockText(product.stock, product.minStock, product.isService)}
                          </span>
                          {getStatusBadge(product.status)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                        No items available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
                 </Card>
       )}

       {/* Add Item Modal */}
       <AddItemModal
         isOpen={isAddItemModalOpen}
         onClose={() => setIsAddItemModalOpen(false)}
         onItemAdded={handleItemAdded}
       />
     </div>
   )
 }
