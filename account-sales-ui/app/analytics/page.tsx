import { ComingSoon } from '@/components/ui/coming-soon'
import { PieChart } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <ComingSoon 
      title="Advanced Analytics"
      description="Deep dive into your business data with advanced analytics, predictive insights, and machine learning-powered recommendations. This feature will include customer segmentation, sales forecasting, and performance optimization."
      icon={<PieChart className="h-16 w-16 text-gray-400" />}
    />
  )
}
