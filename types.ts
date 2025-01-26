import type { connect as preactConnect } from 'epic-state/preact'
import type { Listener } from 'history'
import type React from 'react'

// biome-ignore lint/suspicious/noExplicitAny: Generic react component.
export type PageComponent = React.FunctionComponent<any> | React.JSX.Element
export type Pages = { [key: string]: PageComponent }
export type Parameters = Record<string, string | number> // TODO numbers possible??

export type RouterState<T extends Parameters> = {
  initialRoute?: string
  homeRoute?: string
  route: string
  parameters: T
  page: PageComponent
  plugin?: typeof preactConnect
  listener: Listener
}

export type NavigateListener = (route: string, parameters: Parameters, initial: boolean) => void
