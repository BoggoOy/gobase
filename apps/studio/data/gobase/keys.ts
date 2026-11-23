// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import type { GoBaseInterval } from './gobase-overview.schema'

export const goBaseKeys = {
  overview: (interval: GoBaseInterval) => ['gobase', 'overview', interval] as const,
}
