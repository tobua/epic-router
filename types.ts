import type { connect as preactConnect } from 'epic-state/preact'
import type { Listener } from 'history'
import type { FunctionComponent, ReactElement } from 'react'

// biome-ignore lint/suspicious/noExplicitAny: Generic react component.
export type PageComponent = FunctionComponent<any> | ReactElement
export type Pages = { [key: string]: PageComponent }
export type Parameters = Record<string, string | number>

export type RouterState<T extends Parameters> = {
  initialRoute?: string
  homeRoute?: string
  route: string
  parameters: T
  page: PageComponent
  plugin?: typeof preactConnect
  listener: Listener
}
