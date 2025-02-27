"use client"

import * as React from "react"
import { type ChartConfig, ChartContext } from "./chart-context"

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, children, className, ...props }: ChartProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={className}
        style={
          {
            "--color-desktop": config.desktop?.color,
            "--color-mobile": config.mobile?.color,
            "--color-tablet": config.tablet?.color,
            "--color-weight": config.weight?.color,
            "--color-bmi": config.bmi?.color,
            "--color-body-fat": config.bodyFat?.color,
            "--color-calories": config.calories?.color,
            "--color-miles": config.miles?.color,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export interface ChartTooltipProps extends React.ComponentPropsWithoutRef<"div"> {
  indicator?: "dot" | "line"
  content?: React.ReactNode
  formatter?: (value: number) => string
  className?: string
  children?: React.ReactNode
}

export function ChartTooltip({
  className,
  content,
  children,
  indicator = "dot",
  formatter = (value) => `${value}`,
  ...props
}: ChartTooltipProps) {
  const { config } = React.useContext(ChartContext)

  return (
    <div
      className={className}
      style={{
        pointerEvents: "none",
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ChartTooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string
  indicator?: "dot" | "line"
  hideLabel?: boolean
  hideValue?: boolean
  formatter?: (value: number) => string
}

export function ChartTooltipContent({
  className,
  indicator = "dot",
  hideLabel = false,
  hideValue = false,
  formatter = (value) => `${value}`,
  ...props
}: ChartTooltipContentProps) {
  const { config } = React.useContext(ChartContext)

  return (
    <div className="rounded-md border bg-background px-3 py-1.5 text-sm shadow-md" {...props}>
      {props.active && props.payload?.length ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">{props.label && <div>{props.label}</div>}</div>
          <div className="flex flex-col gap-1">
            {props.payload.map((payload: any, index: number) => {
              const dataKey = payload.dataKey
              const configKey = dataKey as keyof ChartConfig
              const color = config[configKey]?.color
              const label = config[configKey]?.label
              const Icon = config[configKey]?.icon

              return (
                <div key={index} className="flex items-center gap-2">
                  {indicator === "dot" && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: color,
                      }}
                    />
                  )}
                  {indicator === "line" && (
                    <div
                      className="h-1 w-4"
                      style={{
                        background: color,
                      }}
                    />
                  )}
                  {Icon && <Icon className="h-4 w-4" />}
                  {!hideLabel && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{label}:</span>
                    </div>
                  )}
                  {!hideValue && <div className="text-xs font-medium">{formatter(payload.value)}</div>}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface ChartLegendProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string
}

export function ChartLegend({ className, ...props }: ChartLegendProps) {
  return <div className={className} {...props} />
}

export interface ChartLegendContentProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string
}

export function ChartLegendContent({ className, ...props }: ChartLegendContentProps) {
  const { config } = React.useContext(ChartContext)

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 overflow-auto p-1 text-sm" {...props}>
      {Object.entries(config).map(([key, value]) => {
        if (!value) return null

        const Icon = value.icon

        return (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: value.color,
              }}
            />
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-xs">{value.label}</span>
          </div>
        )
      })}
    </div>
  )
}

