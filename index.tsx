import { state } from 'epic-state'
import type { connect as preactConnect } from 'epic-state/preact'
import { createBrowserHistory, createMemoryHistory } from 'history'
import queryString from 'query-string'
import type { ComponentPropsWithoutRef, JSX } from 'react'
import join from 'url-join'
import type { PageComponent, RouterState } from './types'

let Router: RouterState = {} as RouterState

const createHistory = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    return createBrowserHistory()
  }

  // No URL for ReactNative and Testing (happy-dom doesn't work otherwise).
  return createMemoryHistory()
}

export const history = createHistory()
export const getRouter = () => Router

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

function ErrorPage(message: JSX.Element): PageComponent {
  return () => <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
}

function pathnameToRoute(location = history.location) {
  let name = location.pathname

  const publicUrl = removeLeadingSlash((typeof process !== 'undefined' && process.env.PUBLIC_URL) || '')
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
  if (!search || search.length === 0) {
    return {}
  }
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

export function create(pages: { [key: string]: PageComponent }, initialRoute?: string, connect?: typeof preactConnect) {
  if (!pages || Object.keys(pages).length === 0) {
    // biome-ignore lint/suspicious/noConsoleLog: Validation error for user.
    console.log('Invalid pages argument provided to create().')
    return {}
  }

  Router = state<RouterState>({
    // State
    initialRoute: initialRoute ?? Object.keys(pages)[0] ?? '', // Use the first page as the initial route if not provided.
    pages,
    route: pathnameToRoute() ?? initialRoute ?? '',
    parameters: getSearchParameters(),
    // Plugins, connect state to React.
    plugin: connect,
    // Retrieve current state from history, was private.
    listener({ location }) {
      Router.parameters = Object.assign(getSearchParameters(location), location.state ?? {})
      Router.route = pathnameToRoute(location) ?? ''
    },
    // Derivations
    get page() {
      if (process.env.NODE_ENV !== 'production' && (!Router.pages || Router.initialRoute === undefined)) {
        return ErrorPage(
          <span>
            No <Code>pages</Code> or <Code>initialRoute</Code> configured, configure with <Code>Router.setPages(pages, initialRoute)</Code>.
          </span>,
        )
      }

      if (Router.route === '') {
        return Router.pages[Router.initialRoute] as PageComponent
      }

      if (!Router.pages[Router.route]) {
        const userErrorPage = Router.pages['404']
        if (typeof userErrorPage !== 'undefined') {
          return Router.pages['404'] as PageComponent
        }
        return ErrorPage(
          process.env.NODE_ENV === 'production' ? (
            <span>Page not found!</span>
          ) : (
            <span>
              Route <Code>/{Router.route}</Code> has no associated page!
            </span>
          ),
        )
      }
      return Router.pages[Router.route] as PageComponent
    },
  })

  const removeListener = history.listen(Router.listener)

  return { Router, removeListener }
}

export function go(route: string, parameters = {}, historyState: object = {}, replace = false) {
  Router.route = route
  Router.parameters = parameters

  const searchParameters = Object.keys(parameters).length ? `?${queryString.stringify(parameters)}` : ''

  if (route === Router.initialRoute && !Object.keys(parameters).length) {
    // biome-ignore lint/style/noParameterAssign: Existing logic, might be improved.
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
}

export function back() {
  history.back()
}

export function forward() {
  history.forward()
}

export function initial() {
  Router.route = Router.initialRoute
  history.push(writePath(Router.route))
}

export function reset() {
  Router.pages = {}
  Router.initialRoute = ''
  Router.route = ''
}

export function route() {
  return Router.route
}

export function addPage(route: string, component: PageComponent) {
  Router.pages[route] = component
}

export function Page(props: ComponentPropsWithoutRef<'div'>): JSX.Element {
  return <Router.page {...props} {...Router.parameters} />
}
