// Copyright Boggo Oy. Licensed under the Apache License 2.0.
//
// Contract between the GoBase API and the GoBase Studio home page. The Studio server validates every
// response from the GoBase API against this schema before passing it to the browser.
import { z } from 'zod'

export const GOBASE_INTERVALS = ['60m', '24h', '7d'] as const
export type GoBaseInterval = (typeof GOBASE_INTERVALS)[number]
export const goBaseIntervalSchema = z.enum(GOBASE_INTERVALS)

export const GOBASE_SERVICE_IDS = [
  'postgres',
  'edge_functions',
  'auth',
  'storage',
  'realtime',
] as const
export type GoBaseServiceId = (typeof GOBASE_SERVICE_IDS)[number]

const isoDateTime = z.string().datetime({ offset: true })
const count = z.number().int().nonnegative()
const bytes = z.number().int().nonnegative()

const usageSchema = z.object({
  usedBytes: bytes,
  totalBytes: bytes.positive(),
})

const serviceSchema = z.object({
  id: z.enum(GOBASE_SERVICE_IDS),
  enabled: z.boolean(),
  total: count,
  warnings: count,
  errors: count,
  series: z.array(
    z.object({
      timestamp: isoDateTime,
      ok: count,
      warnings: count,
      errors: count,
    })
  ),
})

export const goBaseOverviewSchema = z.object({
  generatedAt: isoDateTime,
  interval: goBaseIntervalSchema,
  project: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    status: z.enum(['healthy', 'degraded', 'unhealthy', 'paused', 'unknown']),
    computeSize: z.string().min(1),
  }),
  github: z
    .object({
      repository: z.string().min(1),
      branch: z.string().min(1).nullable(),
      url: z.string().url().nullable(),
    })
    .nullable(),
  lastMigration: z
    .object({
      version: z.string().min(1),
      name: z.string().nullable(),
      appliedAt: isoDateTime.nullable(),
    })
    .nullable(),
  lastBackup: z
    .object({
      status: z.enum(['succeeded', 'failed', 'running']),
      completedAt: isoDateTime.nullable(),
    })
    .nullable(),
  infrastructure: z.object({
    postgresVersion: z.string().min(1),
    countryCode: z.string().length(2),
    cpu: z.object({
      cores: z.number().int().positive(),
      usagePercent: z.number().min(0).max(100).nullable(),
    }),
    memory: usageSchema,
    disk: usageSchema,
    connections: z.object({
      active: count,
      max: count.positive(),
    }),
  }),
  requests: z.object({
    total: count,
    successRate: z.number().min(0).max(1).nullable(),
  }),
  services: z.array(serviceSchema),
})

/** Error body returned by the Studio route `/api/gobase/overview`. */
export const goBaseErrorBodySchema = z.object({
  error: z.object({ message: z.string() }),
})

export type GoBaseOverview = z.infer<typeof goBaseOverviewSchema>
export type GoBaseService = z.infer<typeof serviceSchema>
export type GoBaseProjectStatus = GoBaseOverview['project']['status']
export type GoBaseBackupStatus = NonNullable<GoBaseOverview['lastBackup']>['status']
