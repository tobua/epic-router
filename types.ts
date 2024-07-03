import type { connect as preactConnect } from 'epic-state/preact'
import type { Listener } from 'history'
import type { FC } from 'react'

// biome-ignore lint/suspicious/noExplicitAny: Generic react component.
export type PageComponent = FC<any>

export type RouterState = {
  initialRoute: string
  pages: { [key: string]: PageComponent }
  route: string
  parameters: object
  Page: PageComponent
  plugin?: typeof preactConnect
  listener: Listener
}
