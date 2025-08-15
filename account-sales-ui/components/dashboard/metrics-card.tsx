import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  className?: string
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  className 
}: MetricsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : isNegative ? (
              <TrendingDown className="h-3 w-3 text-red-600" />
            ) : null}
            <span className={cn(
              "font-medium",
              isPositive ? "text-green-600" : 
              isNegative ? "text-red-600" : "text-muted-foreground"
            )}>
              {isPositive ? "+" : ""}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">vs {changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
