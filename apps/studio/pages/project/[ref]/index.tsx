// Modified by Boggo Oy for GoBase: self-hosted projects show the GoBase home page.
import { GoBaseHome } from '@/components/interfaces/GoBase/GoBaseHome'
import { ProjectHome } from '@/components/interfaces/ProjectHome/Home'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { ProjectLayoutWithAuth } from '@/components/layouts/ProjectLayout'
import { IS_PLATFORM } from '@/lib/constants'
import type { NextPageWithLayout } from '@/types'

const HomePage: NextPageWithLayout = () => {
  return IS_PLATFORM ? <ProjectHome /> : <GoBaseHome />
}

HomePage.getLayout = (page) => (
  <DefaultLayout>
    <ProjectLayoutWithAuth>{page}</ProjectLayoutWithAuth>
  </DefaultLayout>
)

export default HomePage
