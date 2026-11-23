// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { buildGoBaseOverview } from './GoBase.fixtures'
import { GoBaseHome } from './GoBaseHome'
import type { GoBaseOverview } from '@/data/gobase/gobase-overview.schema'
import { BASE_PATH } from '@/lib/constants'
import { customRender } from '@/tests/lib/custom-render'
import { addAPIMock, mswServer } from '@/tests/lib/msw'

const OVERVIEW_PATH = `${BASE_PATH}/api/gobase/overview`

describe('GoBaseHome', () => {
  test('renders the project overview from the GoBase API', async () => {
    mswServer.use(
      http.get(OVERVIEW_PATH, () => HttpResponse.json<GoBaseOverview>(buildGoBaseOverview()))
    )

    customRender(<GoBaseHome />)

    expect(await screen.findByRole('heading', { name: 'Example project' })).toBeInTheDocument()
    expect(screen.getByText('https://example.gobase.test')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Finland')).toBeInTheDocument()
    expect(screen.getByText('14 / 100')).toBeInTheDocument()
    expect(screen.getByText('12,345')).toBeInTheDocument()
    expect(screen.getByText('99.34%')).toBeInTheDocument()
    expect(screen.getByText('Not enabled')).toBeInTheDocument()
  })

  test('shows a dash for values the collector could not provide', async () => {
    const overview = buildGoBaseOverview()
    mswServer.use(
      http.get(OVERVIEW_PATH, () =>
        HttpResponse.json<GoBaseOverview>({
          ...overview,
          infrastructure: { ...overview.infrastructure, postgresVersion: null, connections: null },
          requests: { total: null, successRate: null },
          services: overview.services.map((service) => ({ ...service, series: [] })),
        })
      )
    )

    customRender(<GoBaseHome />)

    expect(await screen.findByRole('heading', { name: 'Example project' })).toBeInTheDocument()
    // Database, connections, total requests and success rate.
    expect(screen.getAllByText('–')).toHaveLength(4)
    expect(screen.getAllByText('No data for this period').length).toBeGreaterThan(0)
  })

  test('requests a new interval when the period changes', async () => {
    const requestedIntervals: Array<string | null> = []
    mswServer.use(
      http.get(OVERVIEW_PATH, ({ request }) => {
        const interval = new URL(request.url).searchParams.get('interval')
        requestedIntervals.push(interval)
        return HttpResponse.json<GoBaseOverview>(
          buildGoBaseOverview({ interval: interval === '7d' ? '7d' : '24h' })
        )
      })
    )

    customRender(<GoBaseHome />)
    await userEvent.click(await screen.findByRole('radio', { name: 'Last 7 days' }))

    await screen.findByRole('radio', { name: 'Last 7 days', checked: true })
    expect(requestedIntervals).toEqual(['24h', '7d'])
  })

  test('shows the server error message when the API is not configured', async () => {
    // AlertError reads the selected project for its telemetry.
    addAPIMock({
      method: 'get',
      path: '/platform/projects/:ref',
      // @ts-expect-error partial project response
      response: { id: 1, ref: 'default', name: 'Default Project', status: 'ACTIVE_HEALTHY' },
    })
    mswServer.use(
      http.get(OVERVIEW_PATH, () =>
        HttpResponse.json({ error: { message: 'GoBase API is not configured.' } }, { status: 503 })
      )
    )

    customRender(<GoBaseHome />)

    expect(await screen.findByText('Failed to load project overview')).toBeInTheDocument()
  })
})
