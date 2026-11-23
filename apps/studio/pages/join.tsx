import Head from 'next/head'

import { OrganizationInvite } from '@/components/interfaces/OrganizationInvite/OrganizationInvite'
import { buildStudioPageTitle } from '@/lib/page-title'
import type { NextPageWithLayout } from '@/types'

const PAGE_TITLE = buildStudioPageTitle({ section: 'Join Organization', brand: 'GoBase' })

const JoinOrganizationPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
      </Head>
      <OrganizationInvite />
    </>
  )
}

export default JoinOrganizationPage
// Modified by Boggo Oy for GoBase: user-facing "Supabase" text renamed to "GoBase".
