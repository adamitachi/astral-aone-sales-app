import { ComingSoon } from '@/components/ui/coming-soon'
import { Target } from 'lucide-react'

export default function GoalsPage() {
  return (
    <ComingSoon 
      title="Goal Setting & Tracking"
      description="Set, track, and achieve your business goals with smart goal management. This feature will include KPI tracking, milestone management, and automated progress reporting."
      icon={<Target className="h-16 w-16 text-gray-400" />}
    />
  )
}
