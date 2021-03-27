import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { History, createBrowserHistory, createMemoryHistory } from 'history'
import { parse, stringify } from 'query-string'
import join from 'url-join'

const createHistory = () => {
  if (typeof window !== 'undefined') {
    return createBrowserHistory()
  }

  // No URL for ReactNative etc.
  return createMemoryHistory()
}

const removeLeadingSlash = (path: string) => path.replace(/^\/*/, '')

const Error = (message: string) => () => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
)

const parsePath = (path: string) => {
  const publicUrl = removeLeadingSlash(process.env.PUBLIC_URL ?? '')
  const trimmedPath = removeLeadingSlash(path)

  if (publicUrl) {
    return removeLeadingSlash(trimmedPath.replace(publicUrl, ''))
  }

  return trimmedPath
}

const writePath = (path: string) => {
  const publicUrl = removeLeadingSlash(process.env.PUBLIC_URL ?? '')

  if (publicUrl) {
    return join('/', publicUrl, path)
  }

  // join will not work properly in this case.
  if (path === '') {
    return '/'
  }

  return join('/', path)
}

class RouterStore {
  initialRoute: string
  pages = {}
  route: string = null
  parameters = {}
  history: History = null

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

    this.history = createHistory()

    const { search, pathname } = this.history.location

    const path = parsePath(pathname)

    this.history.listen(this.listener.bind(this))

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

    if (route === this.initialRoute && !Object.keys(parameters).length) {
      // eslint-disable-next-line no-param-reassign
      route = ''
    }

    const historyAction = replace ? this.history.replace : this.history.push
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
    this.history.back()
  }

  // eslint-disable-next-line class-methods-use-this
  forward() {
    this.history.forward()
  }

  initial() {
    this.route = this.initialRoute
    this.history.push(writePath(this.route))
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

    let parsedPath = parsePath(location.pathname)

    if (parsedPath === '') {
      parsedPath = this.initialRoute
    }

    this.route = removeLeadingSlash(parsedPath)
  }
}

export const Router = new RouterStore()

export const Page = observer(({ ...props }: any) => (
  <Router.Page {...props} {...Router.parameters} />
))
