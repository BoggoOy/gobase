// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { ToggleGroup, ToggleGroupItem } from 'ui'

import type { GoBaseMessages } from './GoBase.messages'
import { formatRatio } from './GoBase.utils'
import {
  GOBASE_INTERVALS,
  goBaseIntervalSchema,
  type GoBaseInterval,
  type GoBaseOverview,
} from '@/data/gobase/gobase-overview.schema'

type RequestsSummaryProps = {
  requests: GoBaseOverview['requests']
  interval: GoBaseInterval
  onIntervalChange: (interval: GoBaseInterval) => void
  messages: GoBaseMessages
  locale: string
}

export const RequestsSummary = ({
  requests,
  interval,
  onIntervalChange,
  messages,
  locale,
}: RequestsSummaryProps) => {
  const handleValueChange = (value: string) => {
    // Radix sends an empty string when the active item is clicked again; keep the current interval.
    const parsed = goBaseIntervalSchema.safeParse(value)
    if (parsed.success) onIntervalChange(parsed.data)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        <Metric
          label={messages.totalRequests}
          value={
            requests.total === null
              ? messages.missingValue
              : new Intl.NumberFormat(locale).format(requests.total)
          }
        />
        <Metric
          label={messages.successRate}
          value={
            requests.successRate === null
              ? messages.missingValue
              : formatRatio(requests.successRate, locale)
          }
        />
      </div>
      <ToggleGroup
        type="single"
        value={interval}
        onValueChange={handleValueChange}
        aria-label={messages.intervalAriaLabel}
      >
        {GOBASE_INTERVALS.map((value) => (
          <ToggleGroupItem key={value} value={value} className="text-xs">
            {messages.intervalLabels[value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="font-mono text-xs uppercase text-foreground-light">{label}</span>
    <span className="heading-section text-foreground">{value}</span>
  </div>
)
