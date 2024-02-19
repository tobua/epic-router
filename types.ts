import type { ReactNode, JSX } from 'react'
import type { connect } from 'epic-state/preact'

export type Input = ReactNode | ReactNode[] | ((...args: any[]) => JSX.Element)

export type RouterState = {
  initialRoute?: string
  pages: object
  route: string
  parameters: object
  go: (route: string, parameters?: object, historyState?: object, replace?: boolean) => void
  back: () => void
  forward: () => void
  initial: () => void
  setPages: (pages: { [key: string]: Input }, initialRoute: string) => void
  addPage: (route: string, component: Input) => void
  reset: () => void
  listener: ({ location, action }) => void
  Page: any
  plugin: typeof connect
}
