// Modified by Boggo Oy for GoBase: self-hosted projects render the GoBase home page.
import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { customRender as render } from '@/tests/lib/custom-render'

vi.mock('@/components/interfaces/ProjectHome/Home', () => ({
  ProjectHome: () => <div data-testid="project-home" />,
}))

vi.mock('@/components/interfaces/GoBase/GoBaseHome', () => ({
  GoBaseHome: () => <div data-testid="gobase-home" />,
}))

vi.mock('@/components/layouts/DefaultLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/layouts/ProjectLayout', () => ({
  ProjectLayoutWithAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/gotrue', () => ({
  auth: { onAuthStateChange: vi.fn() },
}))

describe('project home page', () => {
  test('renders GoBaseHome when self-hosted', async () => {
    const { default: HomePage } = await import('@/pages/project/[ref]/index')
    render(<HomePage dehydratedState={undefined} />)
    expect(screen.getByTestId('gobase-home')).toBeInTheDocument()
    expect(screen.queryByTestId('project-home')).not.toBeInTheDocument()
  })
})
