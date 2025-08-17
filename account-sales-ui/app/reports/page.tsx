import { ComingSoon } from '@/components/ui/coming-soon'
import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <ComingSoon 
      title="Reports & Analytics"
      description="Generate comprehensive reports on sales performance, customer insights, and business metrics. This feature will include customizable dashboards, exportable reports, and trend analysis."
      icon={<BarChart3 className="h-16 w-16 text-gray-400" />}
    />
  )
}
