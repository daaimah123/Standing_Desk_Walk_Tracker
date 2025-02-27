"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile, WeightEntry, WalkSession } from "@/lib/types"
import { getWeightEntries, getWalkSessions } from "@/lib/storage"
import { formatDate, getBMICategory, calculateBMI } from "@/lib/utils"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, Calendar, Flame, Ruler, Scale, Target } from "lucide-react"

interface DashboardProps {
  userProfile: UserProfile
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [walkSessions, setWalkSessions] = useState<WalkSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data from local storage
    const weights = getWeightEntries()
    const walks = getWalkSessions()

    // Sort by date
    weights.sort((a, b) => a.date.getTime() - b.date.getTime())
    walks.sort((a, b) => a.date.getTime() - b.date.getTime())

    setWeightEntries(weights)
    setWalkSessions(walks)
    setLoading(false)
  }, [])

  // Calculate current stats
  const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : userProfile.weight

  const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : userProfile.weight

  const weightLost = initialWeight - currentWeight
  const weightRemaining = currentWeight - userProfile.targetWeight

  const currentBMI = calculateBMI(userProfile.height, currentWeight)
  const bmiCategory = getBMICategory(currentBMI)

  // Calculate walking stats
  const totalWalks = walkSessions.length
  const totalMiles = walkSessions.reduce((sum, session) => sum + session.milesWalked, 0)
  const totalCalories = walkSessions.reduce((sum, session) => sum + session.caloriesBurned, 0)
  const totalHours = walkSessions.reduce((sum, session) => sum + session.duration, 0)

  // Prepare chart data
  const weightChartData = weightEntries.map((entry) => ({
    date: formatDate(entry.date),
    weight: entry.weight,
    bodyFat: entry.bodyFat,
    bmi: entry.bmi || calculateBMI(userProfile.height, entry.weight),
  }))

  const walkChartData = walkSessions.map((session) => ({
    date: formatDate(session.date),
    miles: session.milesWalked,
    calories: session.caloriesBurned,
  }))

  // Group walk sessions by week for weekly summary
  const weeklyData: Record<string, { miles: number; calories: number; count: number }> = {}

  walkSessions.forEach((session) => {
    const weekStart = new Date(session.date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Set to Sunday
    const weekKey = formatDate(weekStart)

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { miles: 0, calories: 0, count: 0 }
    }

    weeklyData[weekKey].miles += session.milesWalked
    weeklyData[weekKey].calories += session.caloriesBurned
    weeklyData[weekKey].count += 1
  })

  const weeklyChartData = Object.entries(weeklyData).map(([week, data]) => ({
    week,
    miles: data.miles,
    calories: data.calories,
    count: data.count,
  }))

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeight} lbs</div>
            <p className="text-xs text-muted-foreground">
              {weightLost > 0
                ? `Lost ${weightLost.toFixed(1)} lbs since start`
                : weightLost < 0
                  ? `Gained ${Math.abs(weightLost).toFixed(1)} lbs since start`
                  : "No change since start"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBMI.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{bmiCategory}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMiles.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{totalWalks} walking sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Over {totalHours.toFixed(1)} hours of walking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Track your weight loss journey over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {weightChartData.length > 0 ? (
                <ChartContainer
                  config={{
                    weight: {
                      label: "Weight",
                      color: "hsl(var(--chart-1))",
                    },
                    bmi: {
                      label: "BMI",
                      color: "hsl(var(--chart-2))",
                    },
                    bodyFat: {
                      label: "Body Fat %",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={weightChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-weight)"
                      strokeWidth={2}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="var(--color-bmi)" strokeWidth={2} />
                    {weightChartData.some((data) => data.bodyFat) && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="var(--color-body-fat)"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No weight data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Walking Activity</CardTitle>
            <CardDescription>Miles walked and calories burned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {walkChartData.length > 0 ? (
                <ChartContainer
                  config={{
                    miles: {
                      label: "Miles",
                      color: "hsl(var(--chart-1))",
                    },
                    calories: {
                      label: "Calories",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <AreaChart data={walkChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="miles"
                      stroke="var(--color-miles)"
                      fill="var(--color-miles)"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="calories"
                      stroke="var(--color-calories)"
                      fill="var(--color-calories)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No walking data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Your walking activity by week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {weeklyChartData.length > 0 ? (
              <ChartContainer
                config={{
                  miles: {
                    label: "Miles",
                    color: "hsl(var(--chart-1))",
                  },
                  calories: {
                    label: "Calories",
                    color: "hsl(var(--chart-3))",
                  },
                  count: {
                    label: "Sessions",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={weeklyChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="miles" fill="var(--color-miles)" radius={4} />
                  <Bar yAxisId="right" dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No weekly data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.targetWeight} lbs</div>
            <p className="text-xs text-muted-foreground">
              {weightRemaining > 0 ? `${weightRemaining.toFixed(1)} lbs to go` : "Goal achieved!"}
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (weightLost / (initialWeight - userProfile.targetWeight)) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(userProfile.targetDate)}</div>
            <p className="text-xs text-muted-foreground">Based on {userProfile.weeklyWeightLossGoal} lbs/week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

