// Copyright Boggo Oy. Licensed under the Apache License 2.0.
//
// GoBase project home page. Replaces the upstream self-hosted home page with a Supabase Cloud style
// overview whose data comes from the GoBase API (see `pages/api/gobase/overview.ts`).
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GenericSkeletonLoader } from 'ui-patterns/ShimmeringLoader'

import { getGoBaseMessages, GOBASE_LOCALE } from './GoBase.messages'
import { GoBaseHeader } from './GoBaseHeader'
import { InfrastructureCard } from './InfrastructureCard'
import { RequestsSummary } from './RequestsSummary'
import { ServiceCards } from './ServiceCards'
import { StatusCards } from './StatusCards'
import { ScaffoldContainer, ScaffoldSection } from '@/components/layouts/Scaffold'
import { AlertError } from '@/components/ui/AlertError'
import { goBaseOverviewQueryOptions } from '@/data/gobase/gobase-overview-query'
import type { GoBaseInterval } from '@/data/gobase/gobase-overview.schema'

const DEFAULT_INTERVAL: GoBaseInterval = '24h'

export const GoBaseHome = () => {
  const locale = GOBASE_LOCALE
  const messages = getGoBaseMessages(locale)
  const [interval, setSelectedInterval] = useState<GoBaseInterval>(DEFAULT_INTERVAL)

  const { data, error, isPending, isError } = useQuery({
    ...goBaseOverviewQueryOptions({ interval }),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="h-full w-full">
      <ScaffoldContainer size="large">
        <ScaffoldSection isFullWidth className="gap-10 pb-32">
          {isPending && <GenericSkeletonLoader />}
          {isError && <AlertError error={error} subject={messages.loadFailed} hideContactSupport />}
          {data && (
            <>
              <GoBaseHeader project={data.project} messages={messages} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <StatusCards overview={data} messages={messages} />
                <InfrastructureCard
                  infrastructure={data.infrastructure}
                  messages={messages}
                  locale={locale}
                />
              </div>
              <div className="flex flex-col gap-6">
                <RequestsSummary
                  requests={data.requests}
                  interval={interval}
                  onIntervalChange={setSelectedInterval}
                  messages={messages}
                  locale={locale}
                />
                <ServiceCards
                  services={data.services}
                  interval={data.interval}
                  messages={messages}
                  locale={locale}
                />
              </div>
            </>
          )}
        </ScaffoldSection>
      </ScaffoldContainer>
    </div>
  )
}
