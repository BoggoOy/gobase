// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import type { ComponentProps } from 'react'
import type { LogsBarChart } from 'ui-patterns/LogsBarChart'

import type { GoBaseService } from '@/data/gobase/gobase-overview.schema'

type LogsBarChartDatum = ComponentProps<typeof LogsBarChart>['data'][number]

/** Formats a 0–1 ratio as a percentage, e.g. 0.9934 → "99.3%". */
export function formatRatio(ratio: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: ratio > 0.999 && ratio < 1 ? 2 : 1,
  }).format(ratio)
}

/** Usage as a 0–1 ratio, clamped so a misreported value never breaks a progress bar. */
export function usageRatio(used: number, total: number) {
  if (total <= 0) return 0
  return Math.min(Math.max(used / total, 0), 1)
}

/** Converts a GoBase service series to the shape the shared logs bar chart expects. */
export function toLogsBarChartData(series: GoBaseService['series']): LogsBarChartDatum[] {
  return series.map((point) => ({
    timestamp: point.timestamp,
    ok_count: point.ok,
    warning_count: point.warnings,
    error_count: point.errors,
  }))
}

/** Localized country name for an ISO 3166-1 alpha-2 code, falling back to the code itself. */
export function countryName(countryCode: string, locale: string) {
  try {
    return (
      new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode.toUpperCase()) ??
      countryCode
    )
  } catch {
    return countryCode
  }
}
