"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface SalesChartProps {
  sales?: any[]
}

export function SalesChart({ sales = [] }: SalesChartProps) {
  // Process sales data to create chart data
  const processChartData = () => {
    if (!sales || sales.length === 0) {
      // Return default data if no sales
      return [
        { month: 'Jan', sales: 0, revenue: 0 },
        { month: 'Feb', sales: 0, revenue: 0 },
        { month: 'Mar', sales: 0, revenue: 0 },
        { month: 'Apr', sales: 0, revenue: 0 },
        { month: 'May', sales: 0, revenue: 0 },
        { month: 'Jun', sales: 0, revenue: 0 },
        { month: 'Jul', sales: 0, revenue: 0 },
        { month: 'Aug', sales: 0, revenue: 0 },
        { month: 'Sep', sales: 0, revenue: 0 },
        { month: 'Oct', sales: 0, revenue: 0 },
        { month: 'Nov', sales: 0, revenue: 0 },
        { month: 'Dec', sales: 0, revenue: 0 },
      ]
    }

    // Group sales by month
    const monthlyData: { [key: string]: { sales: number; revenue: number } } = {}
    
    sales.forEach(sale => {
      const date = new Date(sale.saleDate || sale.dateCreated)
      const month = date.toLocaleString('default', { month: 'short' })
      
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, revenue: 0 }
      }
      
      monthlyData[month].sales += 1
      monthlyData[month].revenue += sale.amount || 0
    })

    // Convert to array format for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(month => ({
      month,
      sales: monthlyData[month]?.sales || 0,
      revenue: monthlyData[month]?.revenue || 0
    }))
  }

  const chartData = processChartData()
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'sales' ? `${value} units` : `$${value}`,
                name === 'sales' ? 'Sales Volume' : 'Revenue'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stackId="1" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="2" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
