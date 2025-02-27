"use client"

import type { LucideIcon } from "lucide-react"
import { createContext } from "react"

export interface ChartItem {
  label: string
  color: string
  icon?: LucideIcon
}

export interface ChartConfig {
  desktop?: ChartItem
  mobile?: ChartItem
  tablet?: ChartItem
  weight?: ChartItem
  bmi?: ChartItem
  bodyFat?: ChartItem
  calories?: ChartItem
  miles?: ChartItem
  [key: string]: ChartItem | undefined
}

export const ChartContext = createContext<{
  config: ChartConfig
}>({
  config: {},
})

