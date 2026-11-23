// Copyright Boggo Oy. Licensed under the Apache License 2.0.
//
// Server-only helpers for the GoBase home page. The GoBase API token is read from the environment
// here and never sent to the browser.
import {
  goBaseOverviewSchema,
  type GoBaseInterval,
  type GoBaseOverview,
} from '@/data/gobase/gobase-overview.schema'

export type GoBaseApiConfig = {
  baseUrl: string
  token: string
  projectId: string
}

export type GoBaseOverviewResult =
  | { status: 'success'; data: GoBaseOverview }
  | { status: 'error'; httpStatus: number; message: string }

const REQUEST_TIMEOUT_MS = 10_000

type GoBaseEnv = Record<string, string | undefined>

/** Returns the GoBase API configuration, or null when any required variable is missing or invalid. */
export function readGoBaseApiConfig(env: GoBaseEnv = process.env): GoBaseApiConfig | null {
  const rawUrl = env.GOBASE_API_URL?.trim()
  const token = env.GOBASE_API_TOKEN?.trim()
  const projectId = env.GOBASE_PROJECT_ID?.trim()
  if (!rawUrl || !token || !projectId) return null

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  return { baseUrl: url.toString().replace(/\/+$/, ''), token, projectId }
}

export function buildGoBaseOverviewUrl(config: GoBaseApiConfig, interval: GoBaseInterval) {
  const params = new URLSearchParams({ interval })
  return `${config.baseUrl}/v1/projects/${encodeURIComponent(config.projectId)}/overview?${params}`
}

export async function fetchGoBaseOverview(
  config: GoBaseApiConfig,
  interval: GoBaseInterval,
  fetchImpl: typeof fetch = fetch
): Promise<GoBaseOverviewResult> {
  let response: Response
  try {
    response = await fetchImpl(buildGoBaseOverviewUrl(config, interval), {
      headers: { Accept: 'application/json', Authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    return { status: 'error', httpStatus: 504, message: 'GoBase API did not respond' }
  }

  if (!response.ok) {
    return {
      status: 'error',
      httpStatus: 502,
      message: `GoBase API returned status ${response.status}`,
    }
  }

  const body: unknown = await response.json().catch(() => null)
  const parsed = goBaseOverviewSchema.safeParse(body)
  if (!parsed.success) {
    // Log only the paths of the invalid fields, never the values.
    const fields = parsed.error.issues.map((issue) => issue.path.join('.') || '(root)')
    console.error('GoBase API response failed validation:', fields.join(', '))
    return { status: 'error', httpStatus: 502, message: 'GoBase API returned invalid data' }
  }

  return { status: 'success', data: parsed.data }
}
