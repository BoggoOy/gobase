// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import type { NextApiRequest, NextApiResponse } from 'next'

import { goBaseIntervalSchema } from '@/data/gobase/gobase-overview.schema'
import { apiWrapper } from '@/lib/api/apiWrapper'
import { fetchGoBaseOverview, readGoBaseApiConfig } from '@/lib/api/gobase/overview'
import { IS_PLATFORM } from '@/lib/constants'

const goBaseOverviewRoute = (req: NextApiRequest, res: NextApiResponse) =>
  apiWrapper(req, res, handler)

export default goBaseOverviewRoute

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (IS_PLATFORM) {
    return res.status(404).json({ error: { message: 'Not found' } })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: { message: `Method ${req.method} not allowed` } })
  }

  const interval = goBaseIntervalSchema.safeParse(req.query.interval ?? '24h')
  if (!interval.success) {
    return res.status(400).json({ error: { message: 'Invalid interval' } })
  }

  const config = readGoBaseApiConfig()
  if (!config) {
    return res.status(503).json({
      error: {
        message:
          'GoBase API is not configured. Set GOBASE_API_URL, GOBASE_API_TOKEN and GOBASE_PROJECT_ID.',
      },
    })
  }

  const result = await fetchGoBaseOverview(config, interval.data)
  if (result.status === 'error') {
    return res.status(result.httpStatus).json({ error: { message: result.message } })
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(result.data)
}
