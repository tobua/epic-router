import type { connect as preactConnect } from 'epic-state/preact'
import type { Listener } from 'history'
import type React from 'react'

// biome-ignore lint/suspicious/noExplicitAny: Required to make the type generic.
export type GenericFunctionComponent = React.FunctionComponent<any>
export type PageComponent = GenericFunctionComponent | React.JSX.Element
export type LazyComponent = {
  lazy: () => Promise<{ default: GenericFunctionComponent }>
  _component?: GenericFunctionComponent
  loading?: React.JSX.Element
}
export type Pages = { [key: string]: PageComponent | LazyComponent }
export type Parameters = Record<string, string | number> // TODO numbers possible??

export type RouterState<T extends Parameters> = {
  initialRoute?: string
  homeRoute?: string
  route: string
  parameters: T
  page: PageComponent | LazyComponent
  plugin?: typeof preactConnect
  listener: Listener
  loading: boolean
}

export type NavigateListener = (route: string, parameters: Parameters, initial: boolean) => void
