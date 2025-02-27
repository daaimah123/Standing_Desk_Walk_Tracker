export interface UserProfile {
  id: string
  height: number // in inches
  weight: number // in lbs
  age: number
  gender: "male" | "female" | "other"
  targetWeight: number // in lbs
  weeklyWeightLossGoal: number // in lbs
  targetDate: Date
}

export interface WeightEntry {
  id: string
  date: Date
  weight: number // in lbs
  bodyFat?: number // percentage
  bmi?: number
}

export interface WalkSession {
  id: string
  date: Date
  duration: number // in hours
  speed: number // in mph
  equipment: string
  incline: number // percentage
  caloriesBurned: number
  milesWalked: number
}

export interface Milestone {
  id: string
  date: Date
  type: "weight" | "consistency" | "distance"
  description: string
  achieved: boolean
}

