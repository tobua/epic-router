import { ReactNode } from 'react'
import type { connect } from 'epic-state/react'

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
  listener: ({ location, action }) => void
  Page: any
  plugin: typeof connect
}
