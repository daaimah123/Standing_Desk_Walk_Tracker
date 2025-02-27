import { Button } from "@/components/ui/button"
import { CardDescription } from "@/components/ui/card"
;('"use client')

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile } from "@/lib/types"
import { getMilestones, deleteMilestone } from "@/lib/storage"
import { formatDate } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface MilestonesProps {
  userProfile: UserProfile
}

export default function Milestones({ userProfile }: MilestonesProps) {
  const [milestones, setMilestones] = useState<any[]>([])

  useEffect(() => {
    setMilestones(getMilestones())
  }, [])

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this milestone?")) {
      deleteMilestone(id)
      setMilestones(getMilestones())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <CardDescription>Track your progress towards your goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-center text-muted-foreground">No milestones logged yet</p>
          ) : (
            milestones
              .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
              .map((milestone: any) => (
                <Card key={milestone.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{formatDate(milestone.date)}</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(milestone.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

