// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { Badge, Card, CardContent, cn } from 'ui'

import type { GoBaseMessages } from './GoBase.messages'
import { InlineLink } from '@/components/ui/InlineLink'
import type {
  GoBaseBackupStatus,
  GoBaseOverview,
  GoBaseProjectStatus,
} from '@/data/gobase/gobase-overview.schema'

const STATUS_BADGE_VARIANT = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'destructive',
  paused: 'default',
  unknown: 'default',
} as const satisfies Record<GoBaseProjectStatus, 'success' | 'warning' | 'destructive' | 'default'>

const BACKUP_BADGE_VARIANT = {
  succeeded: 'success',
  failed: 'destructive',
  running: 'default',
} as const satisfies Record<GoBaseBackupStatus, 'success' | 'destructive' | 'default'>

type StatusCardsProps = {
  overview: GoBaseOverview
  messages: GoBaseMessages
}

export const StatusCards = ({ overview, messages }: StatusCardsProps) => {
  const { project, github, lastMigration, lastBackup } = overview

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatusCard label={messages.status}>
        <Badge variant={STATUS_BADGE_VARIANT[project.status]}>
          {messages.statusLabels[project.status]}
        </Badge>
      </StatusCard>

      <StatusCard label={messages.computeSize}>{project.computeSize}</StatusCard>

      <StatusCard label={messages.github}>
        {github === null && (
          <span className="text-foreground-lighter">{messages.githubNotConnected}</span>
        )}
        {github !== null && (
          <span className="truncate">
            {github.url ? (
              <InlineLink href={github.url}>{github.repository}</InlineLink>
            ) : (
              github.repository
            )}
            {github.branch && <span className="text-foreground-lighter"> · {github.branch}</span>}
          </span>
        )}
      </StatusCard>

      <StatusCard label={messages.lastMigration}>
        {lastMigration === null && (
          <span className="text-foreground-lighter">{messages.noMigrations}</span>
        )}
        {lastMigration !== null && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-sm">
              {lastMigration.name ?? lastMigration.version}
            </span>
            {lastMigration.appliedAt && <RelativeTime timestamp={lastMigration.appliedAt} />}
          </div>
        )}
      </StatusCard>

      <StatusCard label={messages.lastBackup} className="sm:col-span-2">
        {lastBackup === null && (
          <span className="text-foreground-lighter">{messages.noBackups}</span>
        )}
        {lastBackup !== null && (
          <div className="flex flex-col items-start gap-1">
            <Badge variant={BACKUP_BADGE_VARIANT[lastBackup.status]}>
              {messages.backupStatusLabels[lastBackup.status]}
            </Badge>
            {lastBackup.completedAt && <RelativeTime timestamp={lastBackup.completedAt} />}
          </div>
        )}
      </StatusCard>
    </div>
  )
}

type StatusCardProps = { label: string; children: ReactNode; className?: string }

const StatusCard = ({ label, children, className }: StatusCardProps) => (
  <Card className={cn('mb-0 md:mb-0', className)}>
    <CardContent className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase text-foreground-light">{label}</span>
      <div className="flex min-h-6 min-w-0 items-center text-foreground">{children}</div>
    </CardContent>
  </Card>
)

const RelativeTime = ({ timestamp }: { timestamp: string }) => (
  <time
    dateTime={timestamp}
    title={dayjs(timestamp).format('YYYY-MM-DD HH:mm')}
    className="text-xs text-foreground-lighter"
  >
    {dayjs(timestamp).fromNow()}
  </time>
)
