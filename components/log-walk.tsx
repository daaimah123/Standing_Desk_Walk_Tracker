"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile, WalkSession } from "@/lib/types"
import { saveWalkSession, getWalkSessions, deleteWalkSession } from "@/lib/storage"
import { calculateCaloriesBurned, calculateMilesWalked, formatDate } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"

const walkFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  duration: z.coerce
    .number()
    .min(0.1, "Duration must be at least 0.1 hours")
    .max(24, "Duration must be less than 24 hours"),
  speed: z.coerce.number().min(0.1, "Speed must be at least 0.1 mph").max(10, "Speed must be less than 10 mph"),
  equipment: z.string().min(2, "Please enter the equipment used"),
  incline: z.coerce.number().min(0, "Incline must be at least 0%").max(15, "Incline must be less than 15%"),
})

interface LogWalkProps {
  userProfile: UserProfile
}

export default function LogWalk({ userProfile }: LogWalkProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walkSessions, setWalkSessions] = useState<WalkSession[]>(getWalkSessions())
  const [editingSession, setEditingSession] = useState<WalkSession | null>(null)

  const form = useForm<z.infer<typeof walkFormSchema>>({
    resolver: zodResolver(walkFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      duration: 1,
      speed: 1.2,
      equipment: "Bodycraft Spacewalker Treadmill",
      incline: 0,
    },
  })

  function onSubmit(values: z.infer<typeof walkFormSchema>) {
    setIsSubmitting(true)

    try {
      // Calculate calories and miles
      const caloriesBurned = calculateCaloriesBurned(userProfile.weight, values.speed, values.duration, values.incline)

      const milesWalked = calculateMilesWalked(values.speed, values.duration)

      // Create or update session
      const session: WalkSession = {
        id: editingSession?.id || uuidv4(),
        date: new Date(values.date),
        duration: values.duration,
        speed: values.speed,
        equipment: values.equipment,
        incline: values.incline,
        caloriesBurned,
        milesWalked,
      }

      // Save to local storage
      saveWalkSession(session)

      // Update state
      setWalkSessions(getWalkSessions())
      setEditingSession(null)

      // Reset form
      form.reset({
        date: new Date().toISOString().split("T")[0],
        duration: 1,
        speed: 1.2,
        equipment: "Bodycraft Spacewalker Treadmill",
        incline: 0,
      })
    } catch (error) {
      console.error("Error saving walk session:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(session: WalkSession) {
    setEditingSession(session)
    form.reset({
      date: session.date.toISOString().split("T")[0],
      duration: session.duration,
      speed: session.speed,
      equipment: session.equipment,
      incline: session.incline,
    })
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this walking session?")) {
      deleteWalkSession(id)
      setWalkSessions(getWalkSessions())

      if (editingSession?.id === id) {
        setEditingSession(null)
        form.reset({
          date: new Date().toISOString().split("T")[0],
          duration: 1,
          speed: 1.2,
          equipment: "Bodycraft Spacewalker Treadmill",
          incline: 0,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingSession ? "Edit Walking Session" : "Log New Walking Session"}</CardTitle>
          <CardDescription>Record your standing desk walking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment</FormLabel>
                      <FormControl>
                        <Input placeholder="Treadmill model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>Enter time in hours (e.g., 1.5 for 1 hour 30 minutes)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speed (mph)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incline (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingSession ? "Update Session" : "Log Session"}
                </Button>

                {editingSession && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSession(null)
                      form.reset({
                        date: new Date().toISOString().split("T")[0],
                        duration: 1,
                        speed: 1.2,
                        equipment: "Bodycraft Spacewalker Treadmill",
                        incline: 0,
                      })
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Walking Sessions</CardTitle>
          <CardDescription>Your logged walking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walkSessions.length === 0 ? (
              <p className="text-center text-muted-foreground">No walking sessions logged yet</p>
            ) : (
              walkSessions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{formatDate(session.date)}</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(session)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Equipment</p>
                            <p>{session.equipment}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p>{session.duration} hours</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Speed</p>
                            <p>{session.speed} mph</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Incline</p>
                            <p>{session.incline}%</p>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Miles Walked</p>
                            <p className="font-medium">{session.milesWalked.toFixed(2)} miles</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Calories Burned</p>
                            <p className="font-medium">{session.caloriesBurned.toFixed(0)} calories</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

