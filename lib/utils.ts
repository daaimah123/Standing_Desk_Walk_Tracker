import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function calculateBMI(heightInches: number, weightLbs: number): number {
  // BMI = (weight in kg) / (height in meters)^2
  const heightMeters = heightInches * 0.0254
  const weightKg = weightLbs * 0.453592
  return weightKg / (heightMeters * heightMeters)
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal weight"
  if (bmi < 30) return "Overweight"
  return "Obese"
}

export function calculateCaloriesBurned(
  weightLbs: number,
  speedMph: number,
  durationHours: number,
  incline = 0,
): number {
  // MET value for walking varies by speed
  let met = 2.0 // base MET for very slow walking

  if (speedMph < 2.0) {
    met = 2.0
  } else if (speedMph < 2.5) {
    met = 2.5
  } else if (speedMph < 3.0) {
    met = 3.0
  } else if (speedMph < 3.5) {
    met = 3.5
  } else if (speedMph < 4.0) {
    met = 4.0
  } else {
    met = 4.5
  }

  // Adjust MET for incline
  met += incline * 0.5

  // Calories = MET * weight in kg * duration in hours
  const weightKg = weightLbs * 0.453592
  return met * weightKg * durationHours
}

export function calculateMilesWalked(speedMph: number, durationHours: number): number {
  return speedMph * durationHours
}

export function calculateWeightLossDate(currentWeight: number, targetWeight: number, weeklyLossRate: number): Date {
  const weightToLose = currentWeight - targetWeight
  const weeksNeeded = weightToLose / weeklyLossRate
  const daysNeeded = weeksNeeded * 7

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysNeeded)

  return targetDate
}

