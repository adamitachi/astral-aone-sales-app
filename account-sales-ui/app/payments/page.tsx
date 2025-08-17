import { ComingSoon } from '@/components/ui/coming-soon'
import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <ComingSoon 
      title="Payments Management"
      description="Track payments, manage recurring billing, and handle payment processing. This feature will include payment history, automated invoicing, and integration with payment gateways."
      icon={<CreditCard className="h-16 w-16 text-gray-400" />}
    />
  )
}
