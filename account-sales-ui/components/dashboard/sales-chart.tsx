"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
  { month: 'Jul', sales: 3490, revenue: 4300 },
  { month: 'Aug', sales: 4000, revenue: 2400 },
  { month: 'Sep', sales: 3000, revenue: 1398 },
  { month: 'Oct', sales: 2000, revenue: 9800 },
  { month: 'Nov', sales: 2780, revenue: 3908 },
  { month: 'Dec', sales: 1890, revenue: 4800 },
]

export function SalesChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
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
