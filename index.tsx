import { state } from 'epic-state'
import { connect } from 'epic-state/preact'
import { createBrowserHistory, createMemoryHistory } from 'history'
import queryString from 'query-string'
import join from 'url-join'
import type { JSX } from 'react'
import type { Input, RouterState } from './types'

const createHistory = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    return createBrowserHistory()
  }

  // No URL for ReactNative and Testing (happy-dom doesn't work otherwise).
  return createMemoryHistory()
}

export const history = createHistory()

const removeLeadingSlash = (path: string) => path.replace(/^\/*/, '')

function Code({ children }: { children: string | string[] }) {
  return (
    <span
      style={{
        fontFamily: 'monospace',
        color: 'initial',
        background: 'lightgray',
        borderRadius: 5,
        paddingLeft: 2,
        paddingRight: 2,
        paddingBottom: 1,
      }}
    >
      {children}
    </span>
  )
}

function Error(message: JSX.Element) {
  return () => <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
}

function pathnameToRoute(Router?: RouterState, location = history.location) {
  let name = location.pathname

  const publicUrl = removeLeadingSlash(process.env.PUBLIC_URL ?? '')
  name = removeLeadingSlash(name) // Cleanup slash.

  if (publicUrl) {
    // Cleanup public url part.
    name = removeLeadingSlash(name.replace(publicUrl, ''))
  }

  if (name === '' && Router && Router.initialRoute) {
    return Router.initialRoute
  }

  return name !== '' ? name : undefined
}

function getSearchParameters(location = history.location) {
  const { search } = location
  if (!search || search.length === 0) return {}
  return queryString.parse(search)
}

function writePath(path: string) {
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

export const Router = state<RouterState>({
  // State
  initialRoute: undefined,
  pages: {},
  route: pathnameToRoute(),
  parameters: getSearchParameters(),
  // Actions
  go(route: string, parameters = {}, historyState: object = {}, replace = false) {
    Router.route = route
    Router.parameters = parameters

    const searchParameters = Object.keys(parameters).length
      ? `?${queryString.stringify(parameters)}`
      : ''

    if (route === Router.initialRoute && !Object.keys(parameters).length) {
      // eslint-disable-next-line no-param-reassign
      route = ''
    }

    const historyAction = replace ? history.replace : history.push
    // WORKAROUND https://github.com/ReactTraining/history/issues/814
    historyAction(
      {
        hash: '',
        search: searchParameters,
        pathname: writePath(route),
      },
      historyState,
    )
  },
  back() {
    history.back()
  },
  forward() {
    history.forward()
  },
  initial() {
    Router.route = Router.initialRoute
    history.push(writePath(Router.route))
  },
  setPages(pages: { [key: string]: Input }, initialRoute: string) {
    Router.pages = pages
    Router.initialRoute = initialRoute

    if (!Router.route) {
      Router.route = initialRoute
    }
  },
  reset() {
    Router.pages = {}
    Router.initialRoute = undefined
    Router.route = undefined
  },
  addPage(route: string, component: Input) {
    Router.pages[route] = component
  },
  // Retrieve current state from history, was private.
  listener({ location }) {
    Router.parameters = Object.assign(getSearchParameters(location), location.state ?? {})
    Router.route = pathnameToRoute(Router, location)
  },
  // Derivations
  get Page() {
    if (
      process.env.NODE_ENV !== 'production' &&
      (!Router.pages || Router.initialRoute === undefined)
    ) {
      return Error(
        <span>
          No <Code>pages</Code> or <Code>initialRoute</Code> configured, configure with{' '}
          <Code>Router.setPages(pages, initialRoute)</Code>.
        </span>,
      )
    }

    if (Router.route === '') {
      return Router.pages[Router.initialRoute]
    }

    if (!Router.pages[Router.route]) {
      const userErrorPage = Router.pages['404']
      if (typeof userErrorPage !== 'undefined') return Router.pages['404']
      return Error(
        process.env.NODE_ENV === 'production' ? (
          <span>Page not found!</span>
        ) : (
          <span>
            Route <Code>/{Router.route}</Code> has no associated page!
          </span>
        ),
      )
    }

    return Router.pages[Router.route]
  },
  // Plugins, connect state to React.
  plugin: connect,
})

const removeListener = history.listen(Router.listener)

export const unlisten = removeListener

export function Page(props: any): JSX.Element {
  return <Router.Page {...props} {...Router.parameters} />
}
