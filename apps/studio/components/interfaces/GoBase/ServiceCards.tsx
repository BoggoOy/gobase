// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { Card, CardContent, CardHeader, CardTitle, cn } from 'ui'
import { LogsBarChart } from 'ui-patterns/LogsBarChart'

import type { GoBaseMessages } from './GoBase.messages'
import { toLogsBarChartData } from './GoBase.utils'
import NoDataPlaceholder from '@/components/ui/Charts/NoDataPlaceholder'
import type { GoBaseInterval, GoBaseService } from '@/data/gobase/gobase-overview.schema'

const DATETIME_FORMAT: Record<GoBaseInterval, string> = {
  '60m': 'HH:mm',
  '24h': 'MMM D, HH:mm',
  '7d': 'MMM D, HH:mm',
}

type ServiceCardsProps = {
  services: GoBaseService[]
  interval: GoBaseInterval
  messages: GoBaseMessages
  locale: string
}

export const ServiceCards = ({ services, interval, messages, locale }: ServiceCardsProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {services.map((service) => (
      <ServiceCard
        key={service.id}
        service={service}
        interval={interval}
        messages={messages}
        locale={locale}
      />
    ))}
  </div>
)

type ServiceCardProps = {
  service: GoBaseService
  interval: GoBaseInterval
  messages: GoBaseMessages
  locale: string
}

const ServiceCard = ({ service, interval, messages, locale }: ServiceCardProps) => {
  const numberFormat = new Intl.NumberFormat(locale)
  const title = messages.serviceLabels[service.id]

  if (!service.enabled) {
    return (
      <Card className="mb-0 flex h-64 flex-col md:mb-0">
        <CardHeader className="border-b-0 pb-0">
          <CardTitle className="font-mono text-xs uppercase text-foreground-light">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center text-sm text-foreground-lighter">
          {messages.serviceDisabled}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-0 flex h-64 flex-col md:mb-0">
      <CardHeader className="flex flex-row items-end justify-between gap-2 space-y-0 border-b-0 pb-0">
        <div className="flex flex-col">
          <CardTitle className="font-mono text-xs uppercase text-foreground-light">
            {title}
          </CardTitle>
          <span className="text-xl text-foreground">{numberFormat.format(service.total)}</span>
        </div>
        <div className="flex flex-col items-end text-xs">
          <span className={cn(service.warnings > 0 ? 'text-warning' : 'text-foreground-lighter')}>
            {messages.warnings}: {numberFormat.format(service.warnings)}
          </span>
          <span className={cn(service.errors > 0 ? 'text-destructive' : 'text-foreground-lighter')}>
            {messages.errors}: {numberFormat.format(service.errors)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-card">
        <LogsBarChart
          isFullHeight
          hideZeroValues
          data={toLogsBarChartData(service.series)}
          DateTimeFormat={DATETIME_FORMAT[interval]}
          chartConfig={{
            ok_count: { label: messages.requests },
            warning_count: { label: messages.warnings },
            error_count: { label: messages.errors },
          }}
          EmptyState={<NoDataPlaceholder size="small" message={messages.noData} isFullHeight />}
        />
      </CardContent>
    </Card>
  )
}
