"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserProfile } from "@/lib/types"
import { saveUserProfile } from "@/lib/storage"
import { calculateWeightLossDate } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

const profileFormSchema = z.object({
  height: z.coerce.number().min(36, "Height must be at least 36 inches").max(96, "Height must be less than 96 inches"),
  weight: z.coerce.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  age: z.coerce.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  gender: z.enum(["male", "female", "other"]),
  targetWeight: z.coerce
    .number()
    .min(50, "Target weight must be at least 50 lbs")
    .max(500, "Target weight must be less than 500 lbs"),
  weeklyWeightLossGoal: z.coerce
    .number()
    .min(0.5, "Weekly goal must be at least 0.5 lbs")
    .max(2, "Weekly goal must be less than 2 lbs"),
})

interface ProfileSetupProps {
  initialData?: UserProfile
  onProfileSaved: (profile: UserProfile) => void
}

export default function ProfileSetup({ initialData, onProfileSaved }: ProfileSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData
      ? {
          height: initialData.height,
          weight: initialData.weight,
          age: initialData.age,
          gender: initialData.gender,
          targetWeight: initialData.targetWeight,
          weeklyWeightLossGoal: initialData.weeklyWeightLossGoal,
        }
      : {
          height: 60, // 5ft
          weight: 265,
          age: 32,
          gender: "female",
          targetWeight: 245, // 20 lbs less
          weeklyWeightLossGoal: 2,
        },
  })

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true)

    try {
      // Calculate target date based on weekly weight loss goal
      const targetDate = calculateWeightLossDate(values.weight, values.targetWeight, values.weeklyWeightLossGoal)

      // Create or update profile
      const profile: UserProfile = {
        id: initialData?.id || uuidv4(),
        ...values,
        targetDate,
      }

      // Save to local storage
      saveUserProfile(profile)

      // Notify parent component
      onProfileSaved(profile)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (inches)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="60" {...field} />
                </FormControl>
                <FormDescription>Enter your height in inches (5ft = 60 inches)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150" {...field} />
                </FormControl>
                <FormDescription>Enter your current weight in pounds</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="130" {...field} />
                </FormControl>
                <FormDescription>Enter your target weight in pounds</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weeklyWeightLossGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Weight Loss Goal (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2" step="0.1" {...field} />
                </FormControl>
                <FormDescription>Recommended: 1-2 lbs per week</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Form>
  )
}

