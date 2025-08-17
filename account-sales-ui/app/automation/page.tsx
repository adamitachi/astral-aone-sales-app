import { ComingSoon } from '@/components/ui/coming-soon'
import { Zap } from 'lucide-react'

export default function AutomationPage() {
  return (
    <ComingSoon 
      title="Workflow Automation"
      description="Automate repetitive tasks and streamline your business processes. This feature will include automated email campaigns, task scheduling, and intelligent workflow triggers."
      icon={<Zap className="h-16 w-16 text-gray-400" />}
    />
  )
}
