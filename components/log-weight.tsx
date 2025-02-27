"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile, WeightEntry } from "@/lib/types"
import { saveWeightEntry, getWeightEntries, deleteWeightEntry } from "@/lib/storage"
import { calculateBMI, formatDate } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { Trash2 } from "lucide-react"

const weightFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  weight: z.coerce.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  bodyFat: z.coerce
    .number()
    .min(0, "Body fat must be at least 0%")
    .max(70, "Body fat must be less than 70%")
    .optional(),
})

interface LogWeightProps {
  userProfile: UserProfile
}

export default function LogWeight({ userProfile }: LogWeightProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(getWeightEntries())
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null)

  const form = useForm<z.infer<typeof weightFormSchema>>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      weight: userProfile.weight,
      bodyFat: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof weightFormSchema>) {
    setIsSubmitting(true)

    try {
      // Calculate BMI
      const bmi = calculateBMI(userProfile.height, values.weight)

      // Create or update entry
      const entry: WeightEntry = {
        id: editingEntry?.id || uuidv4(),
        date: new Date(values.date),
        weight: values.weight,
        bodyFat: values.bodyFat,
        bmi,
      }

      // Save to local storage
      saveWeightEntry(entry)

      // Update state
      setWeightEntries(getWeightEntries())
      setEditingEntry(null)

      // Reset form
      form.reset({
        date: new Date().toISOString().split("T")[0],
        weight: values.weight,
        bodyFat: undefined,
      })
    } catch (error) {
      console.error("Error saving weight entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(entry: WeightEntry) {
    setEditingEntry(entry)
    form.reset({
      date: entry.date.toISOString().split("T")[0],
      weight: entry.weight,
      bodyFat: entry.bodyFat,
    })
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this weight entry?")) {
      deleteWeightEntry(id)
      setWeightEntries(getWeightEntries())

      if (editingEntry?.id === id) {
        setEditingEntry(null)
        form.reset({
          date: new Date().toISOString().split("T")[0],
          weight: userProfile.weight,
          bodyFat: undefined,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingEntry ? "Edit Weight Entry" : "Log New Weight"}</CardTitle>
          <CardDescription>Track your weight and body composition</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat % (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingEntry ? "Update Entry" : "Log Weight"}
                </Button>

                {editingEntry && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingEntry(null)
                      form.reset({
                        date: new Date().toISOString().split("T")[0],
                        weight: userProfile.weight,
                        bodyFat: undefined,
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
          <CardTitle>Weight History</CardTitle>
          <CardDescription>Your logged weight entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weightEntries.length === 0 ? (
              <p className="text-center text-muted-foreground">No weight entries logged yet</p>
            ) : (
              weightEntries
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{formatDate(entry.date)}</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground">Weight</p>
                            <p className="font-medium">{entry.weight} lbs</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">BMI</p>
                            <p>{entry.bmi?.toFixed(1)}</p>
                          </div>
                          {entry.bodyFat !== undefined && (
                            <div>
                              <p className="text-muted-foreground">Body Fat</p>
                              <p>{entry.bodyFat}%</p>
                            </div>
                          )}
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

