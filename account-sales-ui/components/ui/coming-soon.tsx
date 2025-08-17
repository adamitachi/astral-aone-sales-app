"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Construction, Rocket } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {icon || <Clock className="h-16 w-16 text-gray-400" />}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-700 mb-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-6">
            {description || "This feature is currently under development and will be available in a future update."}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Construction className="h-4 w-4" />
            <span>Coming Soon</span>
            <Rocket className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
