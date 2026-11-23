// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Progress } from 'ui'

import { formatMessage, type GoBaseMessages } from './GoBase.messages'
import { countryName, formatRatio, usageRatio } from './GoBase.utils'
import type { GoBaseOverview } from '@/data/gobase/gobase-overview.schema'
import { formatBytes } from '@/lib/helpers'

type InfrastructureCardProps = {
  infrastructure: GoBaseOverview['infrastructure']
  messages: GoBaseMessages
  locale: string
}

export const InfrastructureCard = ({
  infrastructure,
  messages,
  locale,
}: InfrastructureCardProps) => {
  const { cpu, memory, disk, connections } = infrastructure
  const cpuRatio = cpu.usagePercent === null ? null : cpu.usagePercent / 100
  const memoryRatio = usageRatio(memory.usedBytes, memory.totalBytes)
  const diskRatio = usageRatio(disk.usedBytes, disk.totalBytes)
  const connectionsRatio =
    connections === null ? null : usageRatio(connections.active, connections.max)

  return (
    <Card className="mb-0 h-full md:mb-0">
      <CardHeader>
        <CardTitle>{messages.infrastructure}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y p-0">
        <InfraRow
          label={messages.database}
          value={
            infrastructure.postgresVersion === null
              ? messages.missingValue
              : `Postgres ${infrastructure.postgresVersion}`
          }
        />
        <InfraRow
          label={messages.location}
          value={countryName(infrastructure.countryCode, locale)}
        />
        <InfraRow
          label={messages.cpu}
          value={formatMessage(messages.cpuCores, { cores: cpu.cores })}
          ratio={cpuRatio}
          detail={
            cpuRatio === null
              ? undefined
              : formatMessage(messages.inUse, { percent: formatRatio(cpuRatio, locale) })
          }
        />
        <InfraRow
          label={messages.disk}
          value={`${formatBytes(disk.usedBytes, 1)} / ${formatBytes(disk.totalBytes, 1)}`}
          ratio={diskRatio}
        />
        <InfraRow
          label={messages.memory}
          value={`${formatBytes(memory.usedBytes, 1)} / ${formatBytes(memory.totalBytes, 1)}`}
          ratio={memoryRatio}
        />
        <InfraRow
          label={messages.connections}
          value={
            connections === null
              ? messages.missingValue
              : `${connections.active} / ${connections.max}`
          }
          ratio={connectionsRatio}
        />
      </CardContent>
    </Card>
  )
}

type InfraRowProps = {
  label: string
  value: ReactNode
  /** 0–1 usage ratio; renders a progress bar when given. */
  ratio?: number | null
  detail?: string
}

const InfraRow = ({ label, value, ratio, detail }: InfraRowProps) => {
  const hasRatio = typeof ratio === 'number'

  return (
    <div className="flex flex-col gap-2 px-card py-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-foreground-light">{label}</span>
        <span className="text-right text-foreground">{value}</span>
      </div>
      {hasRatio && <Progress value={ratio * 100} className="h-1" aria-label={label} />}
      {detail && <span className="text-xs text-foreground-lighter">{detail}</span>}
    </div>
  )
}
