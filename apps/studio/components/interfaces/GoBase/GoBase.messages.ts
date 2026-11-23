// Copyright Boggo Oy. Licensed under the Apache License 2.0.
//
// All user-facing text of the GoBase home page. Add a new language by adding an object with the same
// shape (for example `fi`) to `MESSAGES`; TypeScript checks that no string is missing.
import type {
  GoBaseBackupStatus,
  GoBaseInterval,
  GoBaseProjectStatus,
  GoBaseServiceId,
} from '@/data/gobase/gobase-overview.schema'

export type GoBaseMessages = {
  productName: string
  productTagline: string
  projectUrl: string
  copy: string
  copied: string
  status: string
  statusLabels: Record<GoBaseProjectStatus, string>
  computeSize: string
  github: string
  githubNotConnected: string
  lastMigration: string
  noMigrations: string
  lastBackup: string
  noBackups: string
  backupStatusLabels: Record<GoBaseBackupStatus, string>
  infrastructure: string
  database: string
  location: string
  cpu: string
  /** `{cores}` is replaced with the number of CPU cores. */
  cpuCores: string
  /** `{percent}` is replaced with the formatted usage. */
  inUse: string
  disk: string
  memory: string
  connections: string
  totalRequests: string
  successRate: string
  intervalLabels: Record<GoBaseInterval, string>
  intervalAriaLabel: string
  serviceLabels: Record<GoBaseServiceId, string>
  requests: string
  warnings: string
  errors: string
  serviceDisabled: string
  noData: string
  /** Shown in place of a value that is temporarily unavailable. */
  missingValue: string
  loadFailed: string
}

const en: GoBaseMessages = {
  productName: 'GoBase',
  productTagline: 'Supabase-compatible',
  projectUrl: 'Project URL',
  copy: 'Copy',
  copied: 'Copied',
  status: 'Status',
  statusLabels: {
    healthy: 'Healthy',
    degraded: 'Degraded',
    unhealthy: 'Unhealthy',
    paused: 'Paused',
    unknown: 'Unknown',
  },
  computeSize: 'Compute size',
  github: 'GitHub',
  githubNotConnected: 'Not connected',
  lastMigration: 'Last migration',
  noMigrations: 'No migrations yet',
  lastBackup: 'Last backup',
  noBackups: 'No backups yet',
  backupStatusLabels: {
    succeeded: 'Succeeded',
    failed: 'Failed',
    running: 'In progress',
  },
  infrastructure: 'Infrastructure',
  database: 'Database',
  location: 'Location',
  cpu: 'CPU',
  cpuCores: '{cores} cores',
  inUse: '{percent} in use',
  disk: 'Disk',
  memory: 'Memory',
  connections: 'Connections',
  totalRequests: 'Total requests',
  successRate: 'Success rate',
  intervalLabels: {
    '60m': 'Last 60 minutes',
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
  },
  intervalAriaLabel: 'Time period',
  serviceLabels: {
    postgres: 'Postgres',
    edge_functions: 'Edge Functions',
    auth: 'Auth',
    storage: 'Storage',
    realtime: 'Realtime',
  },
  requests: 'Requests',
  warnings: 'Warnings',
  errors: 'Errors',
  serviceDisabled: 'Not enabled',
  noData: 'No data for this period',
  missingValue: '–',
  loadFailed: 'Failed to load project overview',
}

const MESSAGES = { en } satisfies Record<string, GoBaseMessages>

export type GoBaseLocale = keyof typeof MESSAGES

export function isGoBaseLocale(value: string | undefined): value is GoBaseLocale {
  return value !== undefined && Object.hasOwn(MESSAGES, value)
}

const configuredLocale = process.env.NEXT_PUBLIC_GOBASE_LOCALE
export const GOBASE_LOCALE: GoBaseLocale = isGoBaseLocale(configuredLocale)
  ? configuredLocale
  : 'en'

export function getGoBaseMessages(locale: GoBaseLocale = GOBASE_LOCALE): GoBaseMessages {
  return MESSAGES[locale]
}

/** Replaces `{name}` placeholders in a message. */
export function formatMessage(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match
  )
}
