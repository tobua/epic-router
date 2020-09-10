import React from 'react'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import {
  createBrowserHistory,
  createMemoryHistory,
  BrowserHistory,
} from 'history'
import { parse, stringify } from 'query-string'

let history: BrowserHistory

if (typeof window !== 'undefined') {
  history = createBrowserHistory()
} else {
  // No URL for ReactNative etc.
  history = createMemoryHistory()
}

const removeLeadingSlash = (path: string) => path.replace(/^\//, '')

const Error = (message: string) => () => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
)

class RouterStore {
  initialRoute: string
  pages = {}
  @observable route: string
  @observable parameters = {}

  constructor() {
    const { pathname, search } = history.location

    const path = removeLeadingSlash(pathname)

    history.listen(this.listener.bind(this))

    if (path && path.length > 0) {
      this.route = path
    }

    if (!search || search.length === 0) {
      return
    }

    this.parameters = parse(search)
  }

  @action
  go(
    route: string,
    parameters: object = {},
    state: object = {},
    replace = false
  ) {
    this.route = route
    this.parameters = parameters

    const search = Object.keys(parameters).length
      ? `?${stringify(parameters)}`
      : ''

    const action = replace ? history.replace : history.push
    action(`${route}${search}`, state)
  }

  @action
  back() {
    history.back()
  }

  @action
  forward() {
    history.forward()
  }

  @action
  reset() {
    this.route = this.initialRoute
    history.push(this.route)
  }

  @action
  setPages(pages: { [key: string]: React.ReactNode }, initialRoute: string) {
    this.pages = pages
    this.initialRoute = initialRoute

    if (!this.route) {
      this.route = initialRoute
    }
  }

  @computed get Page() {
    if (!this.pages || this.initialRoute === undefined) {
      return Error(`No page or initialRoute configured, configure with Router.setPages(pages,
        initialRoute).`)
    }

    if (this.route === '') {
      return this.pages[this.initialRoute]
    }

    if (!this.pages[this.route]) {
      return Error(`Route {this.route} has no associated page!`)
    }

    return this.pages[this.route]
  }

  // Retrieve current state from history.
  @action
  listener({ action, location }) {
    this.parameters = Object.assign(
      parse(location.search),
      location.state ?? {}
    )
    this.route = removeLeadingSlash(location.pathname)
  }
}

export const Router = new RouterStore()

export const Page = observer(() => {
  const { Page, parameters } = Router
  return <Page {...parameters} />
})
