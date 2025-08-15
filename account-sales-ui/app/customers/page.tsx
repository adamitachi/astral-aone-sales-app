"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { AddCustomerModal } from '@/components/customers/add-customer-modal'
import { ViewCustomerModal } from '@/components/customers/view-customer-modal'
import { EditCustomerModal } from '@/components/customers/edit-customer-modal'
import { CustomerActionsDropdown } from '@/components/customers/customer-actions-dropdown'
import { AddSaleModal } from '@/components/customers/add-sale-modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast'

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  dateCreated: string;
  sales: Sale[];
  status?: 'active' | 'inactive' | 'prospect';
  totalSpent?: number;
};

type Sale = {
  id: number;
  customerId: number;
  amount: number;
  saleDate: string;
  description: string;
};

// Fallback data for demonstration when backend is not available
const fallbackCustomers: Customer[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phoneNumber: '+1-555-0101',
    dateCreated: '2024-01-15T10:00:00Z',
    sales: [
      { id: 1, amount: 3500, saleDate: '2024-01-01T10:00:00Z', description: 'Software License' },
      { id: 2, amount: 2200, saleDate: '2024-01-15T10:00:00Z', description: 'Consulting Services' },
      { id: 3, amount: 1800, saleDate: '2024-01-25T10:00:00Z', description: 'Training Program' },
      { id: 4, amount: 1777, saleDate: '2024-02-01T10:00:00Z', description: 'Support Contract' }
    ],
    status: 'active',
    totalSpent: 9277
  },
  {
    id: 2,
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phoneNumber: '+1-555-0102',
    dateCreated: '2024-01-14T14:30:00Z',
    sales: [
      { id: 5, amount: 4200, saleDate: '2024-01-05T10:00:00Z', description: 'Hardware Equipment' },
      { id: 6, amount: 2800, saleDate: '2024-01-20T10:00:00Z', description: 'Software License' },
      { id: 7, amount: 1858, saleDate: '2024-01-30T10:00:00Z', description: 'Consulting Services' }
    ],
    status: 'inactive',
    totalSpent: 8858
  },
  {
    id: 3,
    name: 'Global Solutions',
    email: 'info@globalsolutions.com',
    phoneNumber: '+1-555-0103',
    dateCreated: '2024-01-13T09:15:00Z',
    sales: [
      { id: 8, amount: 3800, saleDate: '2024-01-10T10:00:00Z', description: 'Training Program' },
      { id: 9, amount: 3200, saleDate: '2024-01-20T10:00:00Z', description: 'Software License' },
      { id: 10, amount: 1974, saleDate: '2024-01-30T10:00:00Z', description: 'Support Contract' },
      { id: 11, amount: 1000, saleDate: '2024-02-05T10:00:00Z', description: 'Consulting Services' }
    ],
    status: 'active',
    totalSpent: 9974
  },
  {
    id: 4,
    name: 'Peak Industries',
    email: 'sales@peakindustries.com',
    phoneNumber: '+1-555-0104',
    dateCreated: '2024-01-12T16:45:00Z',
    sales: [
      { id: 12, amount: 2500, saleDate: '2024-01-15T10:00:00Z', description: 'Hardware Equipment' },
      { id: 13, amount: 2000, saleDate: '2024-01-25T10:00:00Z', description: 'Software License' },
      { id: 14, amount: 2015, saleDate: '2024-02-01T10:00:00Z', description: 'Training Program' }
    ],
    status: 'inactive',
    totalSpent: 6515
  },
  {
    id: 5,
    name: 'Coastal Enterprises',
    email: 'contact@coastal.com',
    phoneNumber: '+1-555-0105',
    dateCreated: '2024-01-11T11:20:00Z',
    sales: [
      { id: 15, amount: 432, saleDate: '2024-02-05T10:00:00Z', description: 'Support Contract' }
    ],
    status: 'active',
    totalSpent: 432
  }
];

export default function CustomersPage() {
  const { addToast, ToastContainer } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; customer: Customer | null }>({ isOpen: false, customer: null });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5086/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCustomers(data);
        setBackendStatus('connected');
      } catch (error) {
        console.error('Backend connection failed:', error);
        // Use fallback data when backend is not available
        setCustomers(fallbackCustomers);
        setBackendStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'prospect':
        return <Badge variant="outline">Prospect</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleAddSale = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAddSaleModalOpen(true);
  };

  const handleSaleSubmission = async (saleData: Omit<Sale, 'id'>) => {
    try {
      if (backendStatus === 'connected') {
        // Try to add sale to backend
        const response = await fetch('http://localhost:5086/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData),
        });

        if (response.ok) {
          addToast('Sale added successfully!', 'success');
          // Refresh customers to get updated total spent
          await refreshCustomers();
        } else {
          throw new Error('Failed to add sale to backend');
        }
      } else {
        // Add to local state when backend is not available
        const newSale: Sale = {
          id: Math.max(...customers.flatMap(c => c.sales).map(s => s.id)) + 1,
          ...saleData
        };
        
        setCustomers(prev => prev.map(c => 
          c.id === saleData.customerId 
            ? { 
                ...c, 
                sales: [...c.sales, newSale],
                totalSpent: (c.totalSpent || 0) + saleData.amount
              }
            : c
        ));
        addToast('Sale added successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to add sale:', error);
      addToast('Failed to add sale', 'error');
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteConfirmation({ isOpen: true, customer });
  };

  const confirmDelete = async () => {
    const customer = deleteConfirmation.customer;
    if (!customer) return;

    try {
      if (backendStatus === 'connected') {
        // Try to delete from backend
        const response = await fetch(`http://localhost:5086/api/customers/${customer.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCustomers(prev => prev.filter(c => c.id !== customer.id));
        } else {
          throw new Error('Failed to delete customer from backend');
        }
      } else {
        // Remove from local state when backend is not available
        setCustomers(prev => prev.filter(c => c.id !== customer.id));
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      // Fallback: remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
    }
  };

  const handleUpdateCustomer = async (id: number, customerData: Partial<Customer>) => {
    try {
      if (backendStatus === 'connected') {
        // Try to update in backend
        const response = await fetch(`http://localhost:5086/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        if (response.ok) {
          const updatedCustomer = await response.json();
          setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
        } else {
          throw new Error('Failed to update customer in backend');
        }
      } else {
        // Update in local state when backend is not available
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      // Fallback: update in local state
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    }
  };

  const refreshCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5086/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to refresh customers:', error);
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'dateCreated' | 'sales' | 'status' | 'totalSpent'>) => {
    try {
      if (backendStatus === 'connected') {
        // Try to add to backend
        const response = await fetch('http://localhost:5086/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        if (response.ok) {
          const newCustomer = await response.json();
          setCustomers(prev => [...prev, {
            ...newCustomer,
            status: 'active',
            sales: [],
            totalSpent: 0
          }]);
          addToast('Customer added successfully!', 'success');
        } else {
          throw new Error('Failed to add customer to backend');
        }
      } else {
        // Add to local state when backend is not available
        const newCustomer: Customer = {
          id: Math.max(...customers.map(c => c.id)) + 1,
          ...customerData,
          dateCreated: new Date().toISOString(),
          sales: [],
          status: 'active',
          totalSpent: 0
        };
        setCustomers(prev => [...prev, newCustomer]);
        addToast('Customer added successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      // Fallback: add to local state
      const newCustomer: Customer = {
        id: Math.max(...customers.map(c => c.id)) + 1,
        ...customerData,
        dateCreated: new Date().toISOString(),
        sales: [],
        status: 'active',
        totalSpent: 0
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Backend Status Alert */}
      {backendStatus === 'disconnected' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Backend Connection
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Unable to connect to the .NET backend. Showing demo data. 
                Make sure to start the backend with <code className="bg-yellow-100 px-1 rounded">dotnet run</code> in the AccountSalesApp.WebApp directory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and data</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
            <Button 
              variant="outline"
              onClick={() => setFilterStatus('all')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading customers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">ID: {customer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{customer.email}</span>
                            </div>
                          )}
                          {customer.phoneNumber && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{customer.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(customer.status || 'active')}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">
                          ${customer.totalSpent?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(customer.dateCreated)}</span>
                        </div>
                      </td>
                                              <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <CustomerActionsDropdown
                              customer={customer}
                              onView={handleViewCustomer}
                              onEdit={handleEditCustomer}
                              onDelete={handleDeleteCustomer}
                              onAddSale={handleAddSale}
                            />
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      {/* View Customer Modal */}
      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onUpdateCustomer={handleUpdateCustomer}
      />

      {/* Add Sale Modal */}
      <AddSaleModal
        isOpen={isAddSaleModalOpen}
        onClose={() => {
          setIsAddSaleModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onAddSale={handleSaleSubmission}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, customer: null })}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirmation.customer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
