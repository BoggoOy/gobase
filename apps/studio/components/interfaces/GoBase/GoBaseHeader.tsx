// Copyright Boggo Oy. Licensed under the Apache License 2.0.
import { Badge } from 'ui'

import type { GoBaseMessages } from './GoBase.messages'
import CopyButton from '@/components/ui/CopyButton'
import type { GoBaseOverview } from '@/data/gobase/gobase-overview.schema'

type GoBaseHeaderProps = {
  project: GoBaseOverview['project']
  messages: GoBaseMessages
}

export const GoBaseHeader = ({ project, messages }: GoBaseHeaderProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-3xl">{project.name}</h1>
      <Badge>
        {messages.productName} · {messages.productTagline}
      </Badge>
    </div>
    <div className="flex min-w-0 items-center gap-2">
      <span className="sr-only">{messages.projectUrl}</span>
      <code className="truncate rounded-sm bg-surface-200 px-2 py-1 font-mono text-sm text-foreground-light">
        {project.url}
      </code>
      <CopyButton
        iconOnly
        variant="default"
        text={project.url}
        copyLabel={messages.copy}
        copiedLabel={messages.copied}
        aria-label={`${messages.copy} ${messages.projectUrl}`}
      />
    </div>
  </div>
)
