import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import {
  createBrowserHistory,
  createMemoryHistory,
  BrowserHistory,
} from 'history'
import { parse, stringify } from 'query-string'
import join from 'url-join'

let history: BrowserHistory

if (typeof window !== 'undefined') {
  history = createBrowserHistory()
} else {
  // No URL for ReactNative etc.
  history = createMemoryHistory()
}

const removeLeadingSlash = (path: string) => path.replace(/^\/*/, '')

const Error = (message: string) => () => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
)

// Make sure PUBLIC_URL can be inserted by bundler, but will not cause error if missing.
const getPublicUrl = () => {
  if (process && process.env) {
    return process.env.PUBLIC_URL ?? ''
  }

  return ''
}

const parsePath = (path: string) => {
  const publicUrl = removeLeadingSlash(getPublicUrl())
  const trimmedPath = removeLeadingSlash(path)

  if (publicUrl) {
    return removeLeadingSlash(trimmedPath.replace(publicUrl, ''))
  }

  return trimmedPath
}

const writePath = (path: string) => {
  const publicUrl = removeLeadingSlash(getPublicUrl())

  if (publicUrl) {
    return join('/', publicUrl, path)
  }

  return join('/', path)
}

class RouterStore {
  initialRoute: string
  pages = {}
  route: string = null
  parameters = {}

  constructor() {
    makeObservable(this, {
      route: observable,
      parameters: observable,
      go: action,
      initial: action,
      setPages: action,
      addPage: action,
      // @ts-ignore
      listener: action,
      Page: computed,
    })

    const { search, pathname } = history.location

    const path = parsePath(pathname)

    history.listen(this.listener.bind(this))

    if (path && path.length > 0) {
      this.route = path
    }

    if (!search || search.length === 0) {
      return
    }

    this.parameters = parse(search)
  }

  go(route: string, parameters = {}, state: object = {}, replace = false) {
    this.route = route
    this.parameters = parameters

    const search = Object.keys(parameters).length
      ? `?${stringify(parameters)}`
      : ''

    const historyAction = replace ? history.replace : history.push
    // WORKAROUND https://github.com/ReactTraining/history/issues/814
    historyAction(
      {
        hash: '',
        search,
        pathname: writePath(route),
      },
      state
    )
  }

  // Static would require instantiation and another import.
  // eslint-disable-next-line class-methods-use-this
  back() {
    history.back()
  }

  // eslint-disable-next-line class-methods-use-this
  forward() {
    history.forward()
  }

  initial() {
    this.route = this.initialRoute
    history.push(writePath(this.route))
  }

  setPages(pages: { [key: string]: React.ReactNode }, initialRoute: string) {
    this.pages = pages
    this.initialRoute = initialRoute

    if (!this.route) {
      this.route = initialRoute
    }
  }

  addPage(route: string, component: React.ReactNode) {
    this.pages[route] = component
  }

  // @ts-ignore
  get Page() {
    if (!this.pages || this.initialRoute === undefined) {
      return Error(`No page or initialRoute configured, configure with Router.setPages(pages,
        initialRoute).`)
    }

    if (this.route === '') {
      return this.pages[this.initialRoute]
    }

    if (!this.pages[this.route]) {
      return Error(`Route ${this.route} has no associated page!`)
    }

    return this.pages[this.route]
  }

  // Retrieve current state from history.
  private listener({ location }) {
    this.parameters = Object.assign(
      parse(location.search),
      location.state ?? {}
    )
    this.route = removeLeadingSlash(parsePath(location.pathname))
  }
}

export const Router = new RouterStore()

export const Page = observer(({ ...props }: any) => (
  <Router.Page {...props} {...Router.parameters} />
))
