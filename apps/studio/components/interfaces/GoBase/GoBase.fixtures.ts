// Copyright Boggo Oy. Licensed under the Apache License 2.0.
// Test data that matches the GoBase API contract. Not used at runtime.
import type { GoBaseOverview } from '@/data/gobase/gobase-overview.schema'

export function buildGoBaseOverview(overrides: Partial<GoBaseOverview> = {}): GoBaseOverview {
  return {
    generatedAt: '2026-11-23T10:00:00Z',
    interval: '24h',
    project: {
      name: 'Example project',
      url: 'https://example.gobase.test',
      status: 'healthy',
      computeSize: 'Small',
    },
    github: {
      repository: 'example-org/example-app',
      branch: 'main',
      url: 'https://github.com/example-org/example-app',
    },
    lastMigration: {
      version: '20261120120000',
      name: 'add_orders_table',
      appliedAt: '2026-11-20T12:00:00Z',
    },
    lastBackup: { status: 'succeeded', completedAt: '2026-11-23T01:45:00Z' },
    infrastructure: {
      postgresVersion: '17.6',
      countryCode: 'FI',
      cpu: { cores: 2, usagePercent: 12.5 },
      memory: { usedBytes: 1_500_000_000, totalBytes: 3_221_225_472 },
      disk: { usedBytes: 8_000_000_000, totalBytes: 32_212_254_720 },
      connections: { active: 14, max: 100 },
    },
    requests: { total: 12_345, successRate: 0.9934 },
    services: [
      {
        id: 'postgres',
        enabled: true,
        total: 8000,
        warnings: 3,
        errors: 1,
        series: [
          { timestamp: '2026-11-23T08:00:00Z', ok: 4000, warnings: 1, errors: 0 },
          { timestamp: '2026-11-23T09:00:00Z', ok: 3996, warnings: 2, errors: 1 },
        ],
      },
      { id: 'edge_functions', enabled: false, total: 0, warnings: 0, errors: 0, series: [] },
      { id: 'auth', enabled: true, total: 345, warnings: 0, errors: 0, series: [] },
    ],
    ...overrides,
  }
}
