"use client"

import { useState, useEffect, useRef } from 'react'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  FileText,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useRouter } from 'next/navigation'
import { useDashboard } from '@/contexts/dashboard-context'
import { RefreshCw } from 'lucide-react'

// Define a TypeScript type for our Customer to match the backend
type Customer = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  dateCreated: string;
  sales: any[]; 
};

// Fallback data for demonstration when backend is not available
const fallbackCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1-555-0123',
    dateCreated: '2024-01-15T10:00:00Z',
    sales: []
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+1-555-0124',
    dateCreated: '2024-01-14T14:30:00Z',
    sales: []
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phoneNumber: '+1-555-0125',
    dateCreated: '2024-01-13T09:15:00Z',
    sales: []
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { settings, lastRefresh, refreshData } = useDashboard();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // This hook runs when the component loads and when refresh interval changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers and sales data
        const [customersResponse, salesResponse] = await Promise.all([
          fetch('http://localhost:5086/api/customers'),
          fetch('http://localhost:5086/api/sales')
        ]);

        if (customersResponse.ok && salesResponse.ok) {
          const customersData = await customersResponse.json();
          const salesData = await salesResponse.json();
          
          setCustomers(customersData);
          setSales(salesData);
          setBackendStatus('connected');
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        // Use fallback data when backend is not available
        setCustomers(fallbackCustomers);
        setSales([]);
        setBackendStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lastRefresh]); // Re-fetch when lastRefresh changes (auto-refresh)

  // Calculate real dashboard data from fetched data
  const dashboardData = {
    totalRevenue: sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0,
    totalCustomers: customers?.length || 0,
    totalSales: sales?.length || 0,
    conversionRate: customers?.length > 0 ? ((sales?.length || 0) / customers.length * 100) : 0,
    monthlyGrowth: 12.5, // This would need historical data to calculate
    customerGrowth: 8.2, // This would need historical data to calculate
    salesGrowth: 15.3, // This would need historical data to calculate
    revenueGrowth: 22.1 // This would need historical data to calculate
  };

  // Filter sales for selected date
  const todaySales = sales?.filter(sale => {
    const saleDate = new Date(sale.saleDate || sale.dateCreated);
    return saleDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  // Quick Actions functions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-sale':
        router.push('/sales');
        break;
      case 'new-customer':
        router.push('/customers');
        break;
      case 'new-invoice':
        router.push('/invoices');
        break;
      case 'view-reports':
        router.push('/reports');
        break;
      default:
        break;
    }
    setIsQuickActionsOpen(false);
  };

  // Handle click outside to close Quick Actions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Backend Status Alert */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            backendStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : backendStatus === 'disconnected' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {backendStatus === 'connected' ? '🟢 Connected' : 
             backendStatus === 'disconnected' ? '🔴 Disconnected' : '🟡 Loading...'}
          </div>
          {settings.refreshInterval > 0 && (
            <div className="text-sm text-gray-600">
              Auto-refresh: {settings.refreshInterval} seconds
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={refreshData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
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

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDate(new Date())}
            className={selectedDate.toDateString() === new Date().toDateString() ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
        
        {/* Quick Actions Dropdown */}
        {isQuickActionsOpen && (
          <div ref={quickActionsRef} className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2 px-2">Quick Actions</div>
              <div className="space-y-1">
                <button
                  onClick={() => handleQuickAction('new-sale')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create New Sale</span>
                </button>
                <button
                  onClick={() => handleQuickAction('new-customer')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Add New Customer</span>
                </button>
                <button
                  onClick={() => handleQuickAction('new-invoice')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => handleQuickAction('view-reports')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">
              {selectedDate.toDateString() === new Date().toDateString() ? "Today's Summary" : `Summary for ${selectedDate.toLocaleDateString()}`}
            </h3>
            <p className="text-sm text-blue-700">
              {isLoading ? 'Loading...' : `${todaySales.length} sales • $${todayRevenue.toLocaleString()} revenue`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
              disabled={isLoading}
            >
              Previous Day
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
              disabled={isLoading}
            >
              Next Day
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {settings.showMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Revenue"
            value={`$${dashboardData.totalRevenue.toLocaleString()}`}
            change={dashboardData.revenueGrowth}
            changeLabel="last month"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricsCard
            title="Total Customers"
            value={dashboardData.totalCustomers.toLocaleString()}
            change={dashboardData.customerGrowth}
            changeLabel="last month"
            icon={<Users className="h-4 w-4" />}
          />
          <MetricsCard
            title="Total Sales"
            value={dashboardData.totalSales.toLocaleString()}
            change={dashboardData.salesGrowth}
            changeLabel="last month"
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <MetricsCard
            title="Conversion Rate"
            value={`${dashboardData.conversionRate}%`}
            change={2.1}
            changeLabel="last month"
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Metrics are currently hidden. Enable them in Settings → App Preferences → Dashboard Preferences.
        </div>
      )}

      {/* Charts and Activity */}
      {settings.showCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SalesChart sales={sales} />
          <RecentActivity sales={sales} />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Charts are currently hidden. Enable them in Settings → App Preferences → Dashboard Preferences.
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Products</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/products')}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Product A', sales: 234, revenue: 11700 },
                { name: 'Product B', sales: 189, revenue: 9450 },
                { name: 'Product C', sales: 156, revenue: 7800 },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Customers</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/customers')}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading customers...</div>
              ) : customers && customers.length > 0 ? customers.slice(0, 3).map((customer) => (
                <div key={customer.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.email || 'No email'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-500">No customers available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/customers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/sales')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Sale
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/invoices')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/reports')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}