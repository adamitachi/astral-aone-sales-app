"use client"

import { useState, useEffect } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useRouter } from 'next/navigation'

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  // This hook runs once when the component loads
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // This is the API call to our running .NET backend!
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
  }, []); // The empty array [] means this effect runs only once

  // Mock data for demonstration - in real app this would come from API
  const dashboardData = {
    totalRevenue: 125000,
    totalCustomers: customers.length || 0,
    totalSales: 1247,
    conversionRate: 3.2,
    monthlyGrowth: 12.5,
    customerGrowth: 8.2,
    salesGrowth: 15.3,
    revenueGrowth: 22.1
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
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SalesChart />
        <RecentActivity />
      </div>

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
              {customers.slice(0, 3).map((customer) => (
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
              ))}
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