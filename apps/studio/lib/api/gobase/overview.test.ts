// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { describe, expect, test, vi } from 'vitest'

import {
  buildGoBaseOverviewUrl,
  fetchGoBaseOverview,
  readGoBaseApiConfig,
  type GoBaseApiConfig,
} from './overview'
import { buildGoBaseOverview } from '@/components/interfaces/GoBase/GoBase.fixtures'

const CONFIG: GoBaseApiConfig = {
  baseUrl: 'https://gobase-api.example.com',
  token: 'test-token',
  projectId: 'project-1',
}

describe('readGoBaseApiConfig', () => {
  test('returns null when a variable is missing', () => {
    expect(readGoBaseApiConfig({})).toBeNull()
    expect(
      readGoBaseApiConfig({
        GOBASE_API_URL: 'https://gobase-api.example.com',
        GOBASE_API_TOKEN: 't',
      })
    ).toBeNull()
  })

  test('rejects URLs that are not http or https', () => {
    expect(
      readGoBaseApiConfig({
        GOBASE_API_URL: 'file:///etc/passwd',
        GOBASE_API_TOKEN: 't',
        GOBASE_PROJECT_ID: 'p',
      })
    ).toBeNull()
    expect(
      readGoBaseApiConfig({
        GOBASE_API_URL: 'not a url',
        GOBASE_API_TOKEN: 't',
        GOBASE_PROJECT_ID: 'p',
      })
    ).toBeNull()
  })

  test('trims values and removes trailing slashes', () => {
    expect(
      readGoBaseApiConfig({
        GOBASE_API_URL: ' https://gobase-api.example.com/base/ ',
        GOBASE_API_TOKEN: ' t ',
        GOBASE_PROJECT_ID: 'p',
      })
    ).toEqual({ baseUrl: 'https://gobase-api.example.com/base', token: 't', projectId: 'p' })
  })
})

describe('buildGoBaseOverviewUrl', () => {
  test('encodes the project id and interval', () => {
    expect(buildGoBaseOverviewUrl({ ...CONFIG, projectId: 'a/b' }, '7d')).toBe(
      'https://gobase-api.example.com/v1/projects/a%2Fb/overview?interval=7d'
    )
  })
})

describe('fetchGoBaseOverview', () => {
  test('sends the bearer token and returns validated data', async () => {
    const overview = buildGoBaseOverview()
    const fetchImpl = vi.fn<typeof fetch>(async () => Response.json(overview))

    const result = await fetchGoBaseOverview(CONFIG, '24h', fetchImpl)

    expect(result).toEqual({ status: 'success', data: overview })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://gobase-api.example.com/v1/projects/project-1/overview?interval=24h')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer test-token')
  })

  test('maps an upstream error status to 502 without the response body', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response('internal details', { status: 500 })
    )

    const result = await fetchGoBaseOverview(CONFIG, '24h', fetchImpl)

    expect(result).toEqual({
      status: 'error',
      httpStatus: 502,
      message: 'GoBase API returned status 500',
    })
  })

  test('rejects responses that do not match the contract', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      Response.json({ ...buildGoBaseOverview(), requests: { total: -1, successRate: 2 } })
    )

    const result = await fetchGoBaseOverview(CONFIG, '24h', fetchImpl)

    expect(result).toEqual({
      status: 'error',
      httpStatus: 502,
      message: 'GoBase API returned invalid data',
    })
    expect(consoleError).toHaveBeenCalledWith(
      'GoBase API response failed validation:',
      'requests.total, requests.successRate'
    )
    consoleError.mockRestore()
  })

  test('returns 504 when the API cannot be reached', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed')
    })

    const result = await fetchGoBaseOverview(CONFIG, '60m', fetchImpl)

    expect(result).toEqual({
      status: 'error',
      httpStatus: 504,
      message: 'GoBase API did not respond',
    })
  })
})
