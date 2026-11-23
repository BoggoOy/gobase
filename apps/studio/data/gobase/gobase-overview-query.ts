// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { queryOptions } from '@tanstack/react-query'

import {
  goBaseErrorBodySchema,
  goBaseOverviewSchema,
  type GoBaseInterval,
} from './gobase-overview.schema'
import { goBaseKeys } from './keys'
import { fetchHandler } from '@/data/fetchers'
import { BASE_PATH, IS_PLATFORM } from '@/lib/constants'
import { ResponseError } from '@/types'

export type GoBaseOverviewVariables = { interval: GoBaseInterval }
export type GoBaseOverviewError = ResponseError

const REFETCH_INTERVAL_MS = 60 * 1000

async function getGoBaseOverview({ interval }: GoBaseOverviewVariables, signal?: AbortSignal) {
  const params = new URLSearchParams({ interval })
  const response = await fetchHandler(`${BASE_PATH}/api/gobase/overview?${params}`, { signal })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const parsedError = goBaseErrorBodySchema.safeParse(body)
    const message = parsedError.success
      ? parsedError.data.error.message
      : `Request failed with status ${response.status}`
    throw new ResponseError(message, response.status)
  }

  return goBaseOverviewSchema.parse(body)
}

export type GoBaseOverviewData = Awaited<ReturnType<typeof getGoBaseOverview>>

export const goBaseOverviewQueryOptions = ({ interval }: GoBaseOverviewVariables) =>
  queryOptions({
    queryKey: goBaseKeys.overview(interval),
    queryFn: ({ signal }) => getGoBaseOverview({ interval }, signal),
    enabled: !IS_PLATFORM,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  })
